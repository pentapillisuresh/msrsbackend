const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Blog = sequelize.define(
    'Blog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Title is required',
          },
        },
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      author: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      // tags: {
      //   type: DataTypes.JSON,
      //   defaultValue: [],
      // },

      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
      },
    },
    {
      tableName: 'blogs',
      timestamps: true,

      hooks: {
        beforeCreate: (blog) => {
          // Ensure views starts at 0 if not provided
          if (blog.views == null) {
            blog.views = 0;
          }
        },
      },
    }
  );

  return Blog;
};