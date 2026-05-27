const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { generateTokens } = require('../utils/jwtHelper');
const { resetAdminPassword, listAllAdmins } = require('../utils/adminSetup');
const bcrypt = require('bcryptjs');

// Create new admin (by super admin)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }
    
    // Create new admin
    const admin = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'admin',
      status: 'active',
      createdBy: req.user.id
    });
    
    const adminData = admin.toJSON();
    delete adminData.password;
    delete adminData.refreshToken;
    
    return successResponse(res, adminData, 'Admin created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: ['admin', 'super_admin'] },
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, admins, 'Admins fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });
    
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    return successResponse(res, admin, 'Admin fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, status } = req.body;
    
    const admin = await User.findByPk(id);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    // Prevent self status change if it's the only admin
    if (id === req.user.id && status === 'inactive') {
      const adminCount = await User.count({ where: { role: ['admin', 'super_admin'], status: 'active' } });
      if (adminCount === 1) {
        return errorResponse(res, 'Cannot deactivate the only active admin', 400);
      }
    }
    
    await admin.update({ name, phoneNumber, status });
    
    const adminData = admin.toJSON();
    delete adminData.password;
    delete adminData.refreshToken;
    
    return successResponse(res, adminData, 'Admin updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await User.findByPk(id);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    // Prevent deleting self
    if (id === req.user.id) {
      return errorResponse(res, 'Cannot delete your own admin account', 400);
    }
    
    // Prevent deleting the last admin
    const adminCount = await User.count({ where: { role: ['admin', 'super_admin'], status: 'active' } });
    if (adminCount === 1) {
      return errorResponse(res, 'Cannot delete the only active admin', 400);
    }
    
    await admin.destroy();
    return successResponse(res, null, 'Admin deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    
    const isValidPassword = await user.validatePassword(oldPassword);
    if (!isValidPassword) {
      return errorResponse(res, 'Old password is incorrect', 401);
    }
    
    user.password = newPassword;
    await user.save();
    
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Reset admin password (by super admin)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const admin = await User.findByPk(id);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    admin.password = newPassword;
    await admin.save();
    
    return successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update last login
const updateLastLogin = async (req, res) => {
  try {
    await req.user.update({ lastLogin: new Date() });
    return successResponse(res, null, 'Last login updated');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const totalAdmins = await User.count({ where: { role: ['admin', 'super_admin'] } });
    const activeAdmins = await User.count({ where: { role: ['admin', 'super_admin'], status: 'active' } });
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalVolunteers = await User.count({ where: { role: 'volunteer' } });
    
    return successResponse(res, {
      totalAdmins,
      activeAdmins,
      totalUsers,
      totalVolunteers
    }, 'Admin statistics fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  changePassword,
  resetPassword,
  updateLastLogin,
  getAdminStats
};