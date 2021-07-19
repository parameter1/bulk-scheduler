const { log } = console;

const batch = async ({
  name,
  totalCount,
  limit,
  page = 1,
  handler = () => {},
  retriever = () => {},
} = {}) => {
  if (!totalCount) return;
  const pages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;
  log(`Handling batch ${page} of ${pages} (L/S ${limit}/${skip}) for '${name}'`);

  const results = await retriever({
    name,
    pages,
    page,
    limit,
    skip,
  });

  await handler({ results, name });
  if (page < pages) {
    await batch({
      name,
      totalCount,
      limit,
      page: page + 1,
      handler,
      retriever,
    });
  }
};

module.exports = batch;
