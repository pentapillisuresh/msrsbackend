const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  category: {
    type: DataTypes.ENUM(
      'blood_bank',
      'educational_resources',
      'food_distribution',
      'vedic_sanskrit_education',
      'goshala',
      'help_people',
      'medical_assistance',
      'yoga_classes',
      'book_bank',
      'others'
    ),
    allowNull: false
  },

  donorName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  donorEmail: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },

  donorPhoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  panNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  amount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

  donorAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'donations',
  timestamps: true
});

module.exports = Donation;
