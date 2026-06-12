const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Volunteer = require('./Volunteer')(sequelize);
const Project = require('./Project')(sequelize);
const Meeting = require('./Meeting')(sequelize);
const Document = require('./Document')(sequelize);
const Event = require('./Event')(sequelize);
const Donation = require('./Donation')(sequelize);
const ELibrary = require('./ELibrary')(sequelize);
const Media = require('./Media')(sequelize);
const BoardMember = require('./BoardMember')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const VolunteerPreference = require('./VolunteerPreference')(sequelize);
const Message = require('./Message')(sequelize); // Add this line
const AccessLog = require('./AccessLog')(sequelize); // Add this line
const blog = require('./Blogs')(sequelize); // Add this line

// Associations
Category.hasMany(Volunteer, { foreignKey: 'categoryId' });
Volunteer.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(Donation, { foreignKey: 'categoryId' });
Donation.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(Project, { foreignKey: 'categoryId' });
Project.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(Event, { foreignKey: 'categoryId' });
Event.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(ELibrary, { foreignKey: 'categoryId' });
ELibrary.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(Media, { foreignKey: 'categoryId' });
Media.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(BoardMember, { foreignKey: 'categoryId' });
BoardMember.belongsTo(Category, { foreignKey: 'categoryId' });

Donation.hasMany(Transaction, { foreignKey: 'donationId' });
Transaction.belongsTo(Donation, { foreignKey: 'donationId' });

Volunteer.hasMany(VolunteerPreference, { foreignKey: 'volunteerId' });
VolunteerPreference.belongsTo(Volunteer, { foreignKey: 'volunteerId' });

User.hasMany(Message, {foreignKey: 'repliedBy'});
Message.belongsTo(User, {foreignKey: 'repliedBy',as: 'repliedUser'});

module.exports = {
  sequelize,
  User,
  Category,
  Volunteer,
  Project,
  Meeting,
  Document,
  Event,
  Donation,
  ELibrary,
  Media,Message,
  BoardMember,
  Transaction,
  VolunteerPreference,
  AccessLog,blog
};