const { filterDsn } = require('@parameter1/base-cms-db/utils');
const { TENANT_KEY } = require('./env');
const basedb = require('./db');
const app = require('./app');

const { log } = console;
process.on('unhandledRejection', (e) => { log(e); throw e; });

const main = async () => {
  try {
    // Open MongoDB connections
    await basedb.connect().then((connection) => log(`MongoDB connected (${filterDsn(connection)}) for ${TENANT_KEY}.`));

    // Run the app
    await app(basedb);

    // Close MongoDB connections
    await basedb.close();
    log('MongoDB connection closed.');
    process.exit(0);
  } catch (e) {
    log(e);
    setImmediate(() => { throw e; });
    process.exit(1);
  }
};

main();
