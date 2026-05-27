const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Multer error
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB' });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field' });
    }
  
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: err.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
  
    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Duplicate entry error', 
        errors: err.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
  
    // JWT error
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
  
    // Default error
    res.status(err.status || 500).json({ 
      message: err.message || 'Internal server error' 
    });
  };
  
  module.exports = errorHandler;