const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Donation = sequelize.define('Donation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    citizenship: {
      type: DataTypes.STRING,
      allowNull: false
    },
    donationType: {
      type: DataTypes.ENUM('once', 'monthly'),
      allowNull: false
    },
    cause: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    donationAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    donerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    donerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    donerPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    panCard: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
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

  return Donation;
};