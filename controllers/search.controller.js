const { Product } = require('../models/product');

const debug = require('debug')('app:search.controller');

const sortOptions = {
  nameasc: { name: 1 },
  namedesc: { name: -1 },
  brandasc: { brand: 1 },
  branddsc: { brand: -1 },
};
const searchProducts = async (req, res, next) => {
  const {
    keyword, skip, limit, sort, min, max, type,
  } = req.query;
  // sort = -1 [desc]
  // sort = 1 [asc]
  let sortFilter = { name: 1 };
  if (sort) {
    const option = sortOptions[sort];
    if (option) {
      sortFilter = option;
    }
  }
  try {
    const priceFilter = [{ price: { $lt: min ?? 0 } }];
    debug(priceFilter);
    if (min) {
      priceFilter.push({ price: { $gt: max } });
    }

    const filter = {
      $and: [
        { $or: [{ price: { $lt: max ?? Number.MAX_VALUE } }, { price: { $gt: min ?? 0 } }] },
        { name: { $exists: true } },
        { productType: { $exists: true, $in: type ? [type] : ['hardware', 'services'] } },
      ],
    };
    if (keyword) {
      filter.$and.push({
        $or: [
          { brand: { $regex: keyword, $options: 'i' } },
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ],
      });
    }

    debug(filter, 'after');
    const products = await Product.find(filter, '-image')
      .where()
      .sort(sortFilter)
      .skip(skip ?? 0)
      .limit(limit ?? 12)
      .lean()
      .exec();

    const count = await Product.find(filter, '-image').count().exec();
    debug(filter, 'return');
    return res.json({ data: products, count });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  searchProducts,
};
