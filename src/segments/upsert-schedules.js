const batch = require('../batch');
const { TENANT_KEY } = require('../env');
const basedb = require('../db');

const limit = 250;
const projection = { status: 1, published: 1, type: 1 };
const endDate = { $exists: false };

const createRef = (doc) => ({
  $ref: 'Content',
  $id: doc._id,
  $db: `${TENANT_KEY}_platform`,
  type: doc.type,
});

const now = new Date();

module.exports = async ({
  productId,
  sectionId,
  optionId,
  query,
} = {}) => {
  const [totalCount, coll] = await Promise.all([
    basedb.count('platform.Content', query),
    basedb.collection('website', 'Schedule'),
  ]);

  const handler = async ({ results }) => {
    const bulkOps = results.map((doc) => {
      const filter = {
        product: productId,
        section: sectionId,
        option: optionId,
        startDate: doc.published,
        status: 1,
        contentStatus: doc.status,
      };

      return {
        updateOne: {
          filter: { 'content.$id': doc._id, endDate, ...filter },
          update: {
            $setOnInsert: { content: createRef(doc), ...filter },
            $set: { '_flags.bulk-scheduled': now },
          },
          upsert: true,
        },
      };
    });

    return coll.bulkWrite(bulkOps, { ordered: false });
  };

  await batch({
    name: 'upsert-schedules',
    limit,
    totalCount,
    handler,
    retriever: ({ skip }) => basedb.find('platform.Content', query, { projection, limit, skip }),
  });
};
