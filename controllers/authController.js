const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validationResult } = require('express-validator');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '3y' } // 3 years as requested
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '5y' } // 5 years as requested
  );
  
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        $or: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to database
    await user.update({ refreshToken });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        $or: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials or account inactive'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to database
    await user.update({ refreshToken });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user and check if refresh token matches
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        refreshToken,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    // Update refresh token in database
    await user.update({ refreshToken: tokens.refreshToken });

    res.json({
      status: 'success',
      message: 'Tokens refreshed successfully',
      data: {
        tokens
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;

    // Clear refresh token from database
    await User.update(
      { refreshToken: null },
      { where: { id: user.id } }
    );

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user.toJSON();
    delete user.password;
    delete user.refreshToken;

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};