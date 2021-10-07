const { filterDsn } = require('@parameter1/base-cms-db/utils');
const inquirer = require('inquirer');
const contentTypeChoices = require('./content-types');
const segments = require('./segments');
const { basedb: createBaseDB, client } = require('./db');

const { log } = console;

module.exports = async () => {
  const { tenantKey } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tenantKey',
      message: 'Select tenant',
      choices: async () => {
        const db = await client.db('admin');
        const { databases } = await db.command({ listDatabases: 1 });
        return databases.filter((d) => d.name.includes('_platform')).map((d) => d.name.replace('_platform', ''));
      },
    },
  ]);
  const basedb = await createBaseDB(tenantKey);
  await basedb.connect().then((connection) => log(`MongoDB connected (${filterDsn(connection)}) for ${tenantKey}.`));
  const sites = await basedb.find('platform.Product', { type: 'Site', status: 1 }, { projection: { name: 1 } });

  const {
    productId,
    sectionId,
    optionId,
    contentTypes,
    filterText,
    limitToSiteIds,
  } = await inquirer.prompt([
    {
      type: 'list',
      name: 'productId',
      message: 'Select site',
      choices: () => sites.map((c) => ({ name: c.name, value: c._id })),
    },
    {
      type: 'list',
      name: 'sectionId',
      message: 'Select section',
      choices: async (ans) => {
        const choices = await basedb.find('website.Section', { 'site.$id': ans.productId, status: 1 }, { projection: { name: 1 } });
        return choices.map((c) => ({ name: c.name, value: c._id }));
      },
    },
    {
      type: 'list',
      name: 'optionId',
      message: 'Select option',
      choices: async (ans) => {
        const query = { status: 1, $or: [{ 'site.$id': ans.productId }, { 'section.$id': ans.sectionId }] };
        const choices = await basedb.find('website.Option', query, { projection: { name: 1 } });
        return choices.map((c) => ({ name: c.name, value: c._id }));
      },
      default: 'Standard Web',
    },
    {
      type: 'checkbox',
      name: 'contentTypes',
      message: 'Which content types should be scheduled?',
      choices: contentTypeChoices,
    },
    {
      type: 'checkbox',
      name: 'limitToSiteIds',
      message: 'Which sites content should be scheduled?',
      choices: () => sites.map((c) => ({ name: c.name, value: c._id })),
      default: (ans) => [ans.productId],
    },
    {
      type: 'input',
      name: 'filterText',
      message: 'Additional query filter (JSON)',
      default: '{}',
      validate: (value) => {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return 'Invalid JSON!';
        }
      },
    },
  ]);

  const contentFilter = JSON.parse(filterText);
  const query = {
    ...(contentTypes.length && { type: { $in: contentTypes } }),
    ...(limitToSiteIds.length && { 'mutations.Website.primarySite': { $in: limitToSiteIds } }),
    ...contentFilter,
  };

  // Upsert the website schedules
  await segments.upsertSchedules({
    basedb,
    tenantKey,
    query,
    productId,
    sectionId,
    optionId,
  });

  // Update the `sectionQuery` field
  await segments.updateSectionQuery({
    basedb,
    query,
    sectionId,
    optionId,
  });

  log('Bulk scheduling complete!');
};
