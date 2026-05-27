const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    objective: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    targetBeneficiaries: {
      type: DataTypes.TEXT,
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
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false
    },
    applicationType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    projectImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    points: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'completed', 'ongoing'),
      defaultValue: 'draft'
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

  return Project;
};