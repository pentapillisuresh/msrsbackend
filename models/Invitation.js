const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invitation = sequelize.define('Invitation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  organizer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contactInfo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  categoryId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  registrationRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'completed', 'suspended'),
    defaultValue: 'planning'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'invitations',
  timestamps: true
});

Invitation.beforeCreate(async (invitation, options) => {
  const lastinvitation = await invitation.findOne({
    order: [['createdAt', 'DESC']]
  });

  let nextNumber = 1;
  if (lastinvitation && lastinvitation.invitationId) {
    const lastNumber = parseInt(lastinvitation.invitationId.replace('EVT-', ''), 10);
    nextNumber = lastNumber + 1;
  }

  const padded = String(nextNumber).padStart(4, '0'); // VOL-0001, VOL-0002, etc.
  invitation.invitationId = `VOL-${padded}`;
});

module.exports = Invitation;