// eslint-disable-next-line no-unused-vars
const { BaseDB } = require('@parameter1/base-cms-db');
const inquirer = require('inquirer');
const contentTypeChoices = require('./content-types');
const batch = require('./batch');

const { log } = console;

const createRef = (doc) => ({
  $ref: 'Content',
  $id: doc._id,
  $db: `${TENANT_KEY}_platform`,
  type: doc.type,
});

/**
 * @param {BaseDB} basedb
 */
module.exports = async (basedb, limit = 250) => {
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

  log({
    productId,
    sectionId,
    optionId,
    contentTypes,
    filterText,
  });
};
