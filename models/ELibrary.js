const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ELibrary = sequelize.define('ELibrary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'puranas',
      'vedic_texts',
      'spiritual_books',
      'social_welfare',
      'economics',
      'philosophy',
      'others'
    ),
    allowNull: false
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  format: {
    type: DataTypes.ENUM('pdf', 'epub', 'audio', 'video'),
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  thumbnailPath: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  publicationYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'elibrary',
  timestamps: true
});

module.exports = ELibrary;