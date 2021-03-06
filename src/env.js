require('dotenv').config();
const envalid = require('@parameter1/base-cms-env');

const { cleanEnv, validators } = envalid;
const { nonemptystr } = validators;

module.exports = cleanEnv(process.env, {
  MONGO_DSN: nonemptystr({ desc: 'The Base MongoDB connection URL.', default: 'mongodb://localhost:9731' }),
});
