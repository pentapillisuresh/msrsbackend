const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Governance = sequelize.define('Governance', {
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
      'trustee_responsibilities',
      'policies',
      'procedures',
      'guidelines',
      'compliance',
      'others'
    ),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true
  },
  effectiveDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  version: {
    type: DataTypes.STRING(10),
    defaultValue: '1.0'
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
  tableName: 'governance',
  timestamps: true
});

module.exports = Governance;