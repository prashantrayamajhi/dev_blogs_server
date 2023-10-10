const { DataTypes } = require("sequelize");
const sequelize = require("../db/db"); // initialize sequelize instance

const news_topic = sequelize.define("news_topic", {
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    trim: true,
    defaultValue: 0,
  },
});

module.exports = news_topic;
