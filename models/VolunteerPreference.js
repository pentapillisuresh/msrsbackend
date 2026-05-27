const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VolunteerPreference = sequelize.define('VolunteerPreference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    volunteerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Volunteers',
        key: 'id'
      }
    },
    areaOfInterest: {
      type: DataTypes.ENUM('projects', 'social_service', 'educational_support', 'events', 'medical_camps', 'others'),
      allowNull: false
    }
  });

  return VolunteerPreference;
};