const { DataTypes } = require("sequelize");
const sequelize = require("./../db/db"); // initialize sequelize instance

const Topic = sequelize.define("topic", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
});

module.exports = Topic;
