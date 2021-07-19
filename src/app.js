const inquirer = require('inquirer');
const contentTypeChoices = require('./content-types');
const segments = require('./segments');

const { log } = console;

module.exports = async (basedb) => {
  const {
    productId,
    sectionId,
    optionId,
    contentTypes,
    filterText,
  } = await inquirer.prompt([
    {
      type: 'list',
      name: 'productId',
      message: 'Select site',
      choices: async () => {
        const choices = await basedb.find('platform.Product', { type: 'Site', status: 1 }, { projection: { name: 1 } });
        return choices.map((c) => ({ name: c.name, value: c._id }));
      },
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
    ...contentFilter,
  };

  // Upsert the website schedules
  await segments.upsertSchedules({
    query,
    productId,
    sectionId,
    optionId,
  });

  // Update the `sectionQuery` field
  await segments.updateSectionQuery({ query, sectionId, optionId });

  log('Bulk scheduling complete!');
};
