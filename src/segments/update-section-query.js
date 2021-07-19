// eslint-disable-next-line no-unused-vars
const batch = require('../batch');

const limit = 250;
const projection = { status: 1, published: 1 };
const now = new Date();

module.exports = async ({
  basedb,
  sectionId,
  optionId,
  query,
} = {}) => {
  const [totalCount, coll] = await Promise.all([
    basedb.count('platform.Content', query),
    basedb.collection('platform', 'Content'),
  ]);

  const handler = async ({ results }) => {
    const bulkOps = results.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $addToSet: { sectionQuery: { sectionId, optionId, start: doc.published } },
          $set: { '_flags.bulk-scheduled': now },
        },
      },
    }));

    return coll.bulkWrite(bulkOps, { ordered: false });
  };

  await batch({
    name: 'update-section-query',
    limit,
    totalCount,
    handler,
    retriever: ({ skip }) => basedb.find('platform.Content', query, { projection, limit, skip }),
  });
};
