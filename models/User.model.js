const { DataTypes } = require("sequelize");
const sequelize = require("./../db/db"); // initialize sequelize instance
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = sequelize.define("user", {
  phone: {
    type: DataTypes.STRING,
    trim: true,
  },
  email: {
    type: DataTypes.STRING,
    trim: true,
  },
  password: {
    type: DataTypes.STRING,
    trim: true,
  },
  socialUserId: {
    type: DataTypes.STRING,
    trim: true,
  },

  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resetPasswordCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

User.beforeCreate(async (user, options) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.prototype.generatePasswordResetToken = async function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

module.exports = User;
