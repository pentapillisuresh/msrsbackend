const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AstrologyConsultation = sequelize.define('AstrologyConsultation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  fullName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  timeOfBirth: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  cityStateCountry: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },

  mobileNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  emailAddress: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },

  completeAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // JSON Array (multiple selected services)
  serviceRequired: {
    type: DataTypes.JSON,
    allowNull: false
  },

  preferredAppointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  preferredAppointmentTime: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  detailedRequirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // NEW FIELD: Number of Attendees
  numberOfAttendees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 20 // You can adjust the maximum as needed
    }
  },

  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  }

}, {
  tableName: 'astrology_consultations',
  timestamps: true
});

module.exports = AstrologyConsultation;