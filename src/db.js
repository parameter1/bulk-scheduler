const { createBaseDB, createMongoClient } = require('@parameter1/base-cms-db');
const { MONGO_DSN } = require('./env');

const client = createMongoClient(MONGO_DSN, { appname: '@parameter1/bulk-schedule', useUnifiedTopology: true });

module.exports = {
  basedb: (tenant) => createBaseDB({ tenant, client }),
  client,
};
