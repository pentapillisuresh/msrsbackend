const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // 👇 Add this custom ID field
  volunteerId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },

  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  qualification: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  occupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  isBloodDonor: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  maritalStatus: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
    allowNull: true
  },
  areasOfInterest: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of interests like temple_service, social_service, educational_support, events, medical_camps, others'
  },
  availability: {
    type: DataTypes.ENUM('weekdays', 'weekends', 'flexible', 'specific_time'),
    allowNull: true
  },
  specificTime: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  feedback_suggestions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'volunteers',
  timestamps: true
});

// 👇 Auto-generate volunteerId before creating a record
Volunteer.beforeCreate(async (volunteer, options) => {
  const lastVolunteer = await Volunteer.findOne({
    order: [['createdAt', 'DESC']]
  });

  let nextNumber = 1;
  if (lastVolunteer && lastVolunteer.volunteerId) {
    const lastNumber = parseInt(lastVolunteer.volunteerId.replace('VOL-', ''), 10);
    nextNumber = lastNumber + 1;
  }

  const padded = String(nextNumber).padStart(4, '0'); // VOL-0001, VOL-0002, etc.
  volunteer.volunteerId = `VOL-${padded}`;
});

module.exports = Volunteer;
