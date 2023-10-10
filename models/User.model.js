const { DataTypes } = require("sequelize");
const sequelize = require("./../db/db"); // initialize sequelize instance
const bcrypt = require("bcrypt");

const User = sequelize.define("user", {
  email: {
    type: DataTypes.STRING,
    trim: true,
  },
  password: {
    type: DataTypes.STRING,
    trim: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

User.beforeCreate(async (user, options) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

module.exports = User;
