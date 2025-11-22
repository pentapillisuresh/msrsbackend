// models/ElibraryCategory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElibraryCategory = sequelize.define('ElibraryCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'event_categories',
  timestamps: true
});

module.exports = ElibraryCategory;
