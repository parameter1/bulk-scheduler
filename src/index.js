const { filterDsn } = require('@parameter1/base-cms-db/utils');
const { basedb } = require('./db');
const app = require('./app');

const { log } = console;
process.on('unhandledRejection', (e) => { log(e); throw e; });
const defaultDb = basedb('default');

const main = async () => {
  try {
    // Open MongoDB connections
    await defaultDb.connect().then((connection) => log(`MongoDB connected (${filterDsn(connection)}).`));

    // Run the app
    await app(defaultDb);

    // Close MongoDB connections
    await defaultDb.close();
    log('MongoDB connection closed.');
    process.exit(0);
  } catch (e) {
    log(e);
    setImmediate(() => { throw e; });
    process.exit(1);
  }
};

main();
