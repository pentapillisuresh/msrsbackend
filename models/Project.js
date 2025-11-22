const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  categoryId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  objective: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetBeneficiaries: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  currentFunding: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // documents: {
  //   type: DataTypes.JSON,
  //   allowNull: true
  // },
  contactPerson: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contactInfo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'completed', 'suspended'),
    defaultValue: 'planning'
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
  tableName: 'projects',
  timestamps: true
});

module.exports = Project;