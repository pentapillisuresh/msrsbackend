const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Temple = sequelize.define('Temple', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'about',
      'schedule',
      'activities',
      'architecture',
      'gallery',
      'directions',
      'important_dates'
    ),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactInfo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  timing: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'temple_info',
  timestamps: true
});

module.exports = Temple;