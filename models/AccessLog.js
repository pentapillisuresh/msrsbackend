const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AccessLog = sequelize.define('AccessLog', { 
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OTP: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired'),
      defaultValue: 'active'
    }

  }, {
    hooks: {
      beforeCreate: (accessLog) => {
        // Generate 6-digit OTP
        accessLog.OTP = Math.floor(100000 + Math.random() * 900000).toString();
      }
    }
  });

  return AccessLog;
};