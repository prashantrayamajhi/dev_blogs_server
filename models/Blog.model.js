const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const Blog = sequelize.define(
  "blog",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    previewText: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    blog: {
      type: DataTypes.TEXT,
      allowNull: false,
      trim: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Blog;
