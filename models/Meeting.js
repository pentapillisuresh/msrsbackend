const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Meeting = sequelize.define('Meeting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cinNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    industryType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    csrRegistrationNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    budgetRequired: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    csrAlignment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    applicantName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
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
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    csrInterests: {
      type: DataTypes.JSON,
      allowNull: true
    },
    proposedCsrBudget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    preferredProjectType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferredProjectLocation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timelineForCsrActivity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferredMeetingMode: {
      type: DataTypes.ENUM('online', 'offline', 'hybrid'),
      allowNull: false
    },
    preferredDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    preferredTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    alternateDateTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    purposeOfMeeting: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    specificRequirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled', 'rescheduled'),
      defaultValue: 'pending'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return Meeting;
};