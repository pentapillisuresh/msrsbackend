const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Temple = require('./Temple');
const Volunteer = require('./Volunteer');
const Invitation = require('./Invitation');
const Media = require('./Media');
const Project = require('./Project');
const Team = require('./Team');
const Governance = require('./Governance');
const ELibrary = require('./ELibrary');
const AstrologyConsultation = require('./AstrologyConsultation');
const Certificate = require('./certificates');

// Define associations here if needed
// Example: User.hasMany(Project, { foreignKey: 'createdBy' });
// Project.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = {
  sequelize,
  User,
  Temple,
  Volunteer,
  Invitation,
  Media,
  Project,
  Team,
  Governance,
  ELibrary,
  AstrologyConsultation,
  Certificate,
};