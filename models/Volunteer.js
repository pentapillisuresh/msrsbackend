const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  volunteerId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name cannot be empty'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      }
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
    allowNull: true,
    validate: {
      isIn: {
        args: [['male', 'female', 'other']],
        msg: 'Gender must be male, female, or other'
      }
    }
  },
  bloodGroup: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  isBloodDonor: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Please provide a valid date of birth'
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: {
        args: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
        msg: 'Please provide a valid phone number'
      }
    }
  },
  maritalStatus: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
    allowNull: true,
    validate: {
      isIn: {
        args: [['single', 'married', 'divorced', 'widowed']],
        msg: 'Marital status must be single, married, divorced, or widowed'
      }
    }
  },
  areasOfInterest: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      isValidAreasOfInterest(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('Areas of interest must be an array');
        }
        if (value) {
          const validInterests = ['temple_service', 'social_service', 'educational_support', 'events', 'medical_camps', 'others'];
          for (const interest of value) {
            if (!validInterests.includes(interest)) {
              throw new Error(`Invalid area of interest: ${interest}`);
            }
          }
        }
      }
    }
  },
  availability: {
    type: DataTypes.ENUM('weekdays', 'weekends', 'flexible', 'specific_time'),
    allowNull: true,
    validate: {
      isIn: {
        args: [['weekdays', 'weekends', 'flexible', 'specific_time']],
        msg: 'Availability must be weekdays, weekends, flexible, or specific_time'
      }
    }
  },
  feedback_suggestions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'approved', 'rejected']],
        msg: 'Status must be pending, approved, or rejected'
      }
    }
  }
}, {
  tableName: 'volunteers',
  timestamps: true,
  hooks: {
    beforeValidate: async (volunteer, options) => {
      // Generate volunteerId only if it doesn't exist or is being created
      if (!volunteer.volunteerId || volunteer.isNewRecord) {
        await generateVolunteerId(volunteer);
      }
    },
    beforeCreate: async (volunteer, options) => {
      // Ensure volunteerId is set before creation
      if (!volunteer.volunteerId) {
        await generateVolunteerId(volunteer);
      }
    }
  }
});

// Helper function to generate volunteer ID
async function generateVolunteerId(volunteer) {
  try {
    console.log('Generating volunteer ID...');
    
    const lastVolunteer = await Volunteer.findOne({
      order: [['id', 'DESC']],
      paranoid: false
    });

    let nextNumber = 1;
    if (lastVolunteer && lastVolunteer.volunteerId) {
      const idMatch = lastVolunteer.volunteerId.match(/\d+/);
      if (idMatch) {
        const lastNumber = parseInt(idMatch[0], 10);
        nextNumber = lastNumber + 1;
      } else {
        // If existing ID doesn't match pattern, count all records
        const count = await Volunteer.count({ paranoid: false });
        nextNumber = count + 1;
      }
    }

    const padded = String(nextNumber).padStart(4, '0');
    volunteer.volunteerId = `VOL-${padded}`;
    
    console.log('Generated volunteerId:', volunteer.volunteerId);
  } catch (error) {
    console.error('Error generating volunteerId:', error);
    // Fallback ID generation using timestamp
    const timestamp = Date.now().toString().slice(-6);
    volunteer.volunteerId = `VOL-${timestamp}`;
  }
}

module.exports = Volunteer;