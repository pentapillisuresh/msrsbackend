const { User } = require('../models');
const bcrypt = require('bcryptjs');

const createAdminIfNotExists = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ 
      where: { role: 'admin' }
    });

    if (!adminExists) {
      // Create default admin user
      const defaultAdmin = {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'Admin@123', // Change this in production
        phoneNumber: '9999999999',
        role: 'admin',
        status: 'active'
      };

      // Create admin
      const admin = await User.create(defaultAdmin);
      
      console.log('=================================');
      console.log('✅ Default Admin Created Successfully!');
      console.log('📧 Email: admin@maha-shree-foundation.org');
      console.log('🔑 Password: Admin@123456');
      console.log('⚠️  Please change this password after first login!');
      console.log('=================================');
      
      return admin;
    } else {
      console.log('✅ Admin user already exists');
      return adminExists;
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
};

// Function to create admin from .env configuration
const createCustomAdminFromEnv = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';
    const adminPhone = process.env.ADMIN_PHONE || '9999999999';

    const adminExists = await User.findOne({ 
      where: { email: adminEmail }
    });

    if (!adminExists) {      
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phoneNumber: adminPhone,
        role: 'admin',
        status: 'active'
      });
      
      console.log('=================================');
      console.log('✅ Custom Admin Created Successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log('⚠️  Please change this password after first login!');
      console.log('=================================');
      
      return admin;
    }
    
    return adminExists;
  } catch (error) {
    console.error('❌ Error creating custom admin:', error.message);
    throw error;
  }
};

// Function to reset admin password
const resetAdminPassword = async (email, newPassword) => {
  try {
    const admin = await User.findOne({ where: { email, role: 'admin' } });
    
    if (!admin) {
      throw new Error('Admin not found');
    }
    
    await admin.update({ password: newPassword });
    
    console.log('✅ Admin password reset successfully');
    return true;
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    throw error;
  }
};

// Function to list all admins
const listAllAdmins = async () => {
  try {
    const admins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: { exclude: ['password', 'refreshToken'] }
    });
    return admins;
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    throw error;
  }
};

module.exports = {
  createAdminIfNotExists,
  createCustomAdminFromEnv,
  resetAdminPassword,
  listAllAdmins
};