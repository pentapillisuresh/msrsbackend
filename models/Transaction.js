const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    donationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Donations',
        key: 'id'
      }
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    razorpayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    razorpaySignature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.ENUM('created', 'attempted', 'paid', 'failed'),
      defaultValue: 'created'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentDetails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    receipt: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return Transaction;
};