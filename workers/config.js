const { Sequelize } = require('sequelize');

const {
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_DIALECT
  } = process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT
});

const dbConnection = async () => {
    try {
      console.log(`🔌 Connecting to DB...`);
      await sequelize.authenticate();
      console.log(`✅ Connected successfully`);
    } catch (error) {
      console.error(`❌ Failed to connect to DB:`, error);
    }
};

module.exports = {
    dbConnection
}