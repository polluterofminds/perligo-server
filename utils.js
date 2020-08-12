require('pg').defaults.parseInt8 = true
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
require('dotenv').config();
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 2000
    },
    dialectOptions: {
        connectionTimeoutMillis: 10000
    },
    retry : {
      backoffBase: 100,
      backoffExponent: 1.1,
      timeout: 60000,
      max: Infinity,
      match: [
        /ConnectionError/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /SequelizeConnectionAcquireTimeoutError/,
        /Connection terminated unexpectedly/
      ],
    },
    minifyAliases: true
});

const models = require('./models');

module.exports = {
    sequelize,
    models
};