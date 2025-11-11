const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is missing or invalid'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password', 'refreshToken'] }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found or inactive'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Access token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid access token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  });
};

const userMiddleware = async (req, res, next) => {
  authMiddleware(req, res, () => {
    
    next();
  });
};


module.exports = {
  authMiddleware,
  adminAuthMiddleware,
  userMiddleware
};
