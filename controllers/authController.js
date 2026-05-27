const { User } = require('../models');
const { generateTokens } = require('../utils/jwtHelper');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'User already exists', 400);
    }
    
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: role || 'user'
    });
    
    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refreshToken });
    
    const userData = user.toJSON();
    delete userData.password;
    delete userData.refreshToken;
    
    return successResponse(res, { user: userData, accessToken, refreshToken }, 'Registration successful', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    if (user.status !== 'active') {
      return errorResponse(res, 'Account is inactive', 401);
    }
    
    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refreshToken });
    
    const userData = user.toJSON();
    delete userData.password;
    delete userData.refreshToken;
    
    return successResponse(res, { user: userData, accessToken, refreshToken }, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await user.update({ refreshToken: newRefreshToken });
    
    return successResponse(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const logout = async (req, res) => {
  try {
    await req.user.update({ refreshToken: null });
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const userData = req.user.toJSON();
    delete userData.password;
    delete userData.refreshToken;
    return successResponse(res, userData, 'Profile fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    await req.user.update({ name, phoneNumber });
    
    const userData = req.user.toJSON();
    delete userData.password;
    delete userData.refreshToken;
    
    return successResponse(res, userData, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};