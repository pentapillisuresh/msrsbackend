const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  changePassword,
  resetPassword,
  updateLastLogin,
  getAdminStats
} = require('../controllers/adminController');

// Middleware to check if user is super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Super Admin only.' });
  }
  next();
};

// Admin management routes (only super admin can create/delete admins)
router.post('/create', verifyToken, isSuperAdmin, createAdmin);
router.get('/all', verifyToken, isAdmin, getAllAdmins);
router.get('/stats', verifyToken, isSuperAdmin, getAdminStats);
router.get('/:id', verifyToken, isAdmin, getAdminById);
router.put('/:id', verifyToken, isSuperAdmin, updateAdmin);
router.delete('/:id', verifyToken, isSuperAdmin, deleteAdmin);
router.post('/reset-password/:id', verifyToken, isSuperAdmin, resetPassword);

// Self management routes
router.post('/change-password', verifyToken, changePassword);
router.post('/update-last-login', verifyToken, updateLastLogin);

module.exports = router;