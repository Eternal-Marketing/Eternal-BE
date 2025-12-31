require('dotenv').config();

// ENV 상수를 직접 읽어오기 (CommonJS 호환)
const getEnv = () => {
  return {
    DbName: process.env.DB_NAME || process.env.DATABASE_NAME || '',
    DbUser: process.env.DB_USER || process.env.DATABASE_USER || '',
    DbPassword: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
    DbHost: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
    DbPort: Number(process.env.DB_PORT || process.env.DATABASE_PORT || 3306),
  };
};

const ENV = getEnv();

module.exports = {
  development: {
    username: ENV.DbUser,
    password: ENV.DbPassword,
    database: ENV.DbName,
    host: ENV.DbHost,
    port: ENV.DbPort,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: ENV.DbUser,
    password: ENV.DbPassword,
    database: ENV.DbName,
    host: ENV.DbHost,
    port: ENV.DbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  },
};
