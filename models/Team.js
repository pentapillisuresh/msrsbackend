const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true
  },
  joinedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
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
  tableName: 'team_members',
  timestamps: true
});

module.exports = Team;