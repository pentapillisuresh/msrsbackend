const express = require('express');
const router = express.Router();
const { verifyToken, verifyRefreshToken } = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', verifyRefreshToken, refreshToken);
router.post('/logout', verifyToken, logout);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;