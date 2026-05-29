const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Volunteer = sequelize.define('Volunteer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maritalStatus: {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
      allowNull: false
    },
    applicationType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    customerArea: {
      type: DataTypes.STRING,
      allowNull: true
    },
    availableStartDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Start date and time of availability'
    },
    availableEndDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'End date and time of availability'
    },
    motivation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    feedbackSuggestion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'inactive'),
      defaultValue: 'pending'
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    }
  });

  return Volunteer;
};