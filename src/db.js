const { createBaseDB, createMongoClient } = require('@parameter1/base-cms-db');
const { MONGO_DSN, TENANT_KEY } = require('./env');

const baseClient = createMongoClient(MONGO_DSN, { appname: '@parameter1/bulk-schedule', useUnifiedTopology: true });

module.exports = createBaseDB({ tenant: TENANT_KEY, client: baseClient });
