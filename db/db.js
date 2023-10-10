const { Sequelize } = require("sequelize");

module.exports = sequelize = new Sequelize(
  process.env.DATABASE_NAME || "dev_blogs",
  process.env.DATABASE_USERNAME || "root",
  process.env.DATABASE_PASSWORD || "root",
  {
    dialect: "mysql",
    host: "localhost",
  }
);
