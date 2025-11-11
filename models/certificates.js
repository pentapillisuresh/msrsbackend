// models/Certificate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Volunteer = require('./Volunteer');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  volunteerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Volunteer,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  eventName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  issuedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  certificateNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issuedBy: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fileUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL of the certificate PDF/image file if stored digitally'
  }
}, {
  tableName: 'certificates',
  timestamps: true
});

// Relationship
// Certificate.belongsTo(Volunteer, { foreignKey: 'volunteerId', as: 'volunteer' });
// Volunteer.hasMany(Certificate, { foreignKey: 'volunteerId', as: 'certificates' });

module.exports = Certificate;
