const debug = require('debug')('app:search.controller');

const { Product } = require('../models/product');

const sortOptions = {
  nameasc: { name: 1 },
  namedesc: { name: -1 },
  brandasc: { normalizedBrand: 1 },
  branddesc: { normalizedBrand: -1 },
  priceasc: { price: 1 },
  pricedesc: { price: -1 },
};

function isSafeNumber(value) {
  return !Number.isNaN(parseInt(value, 10));
}
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
  const minInt = isSafeNumber(min) ? parseFloat(min, 10) : 0;
  const maxInt = isSafeNumber(max) ? parseFloat(max) : max;
  try {
    const filter = {
      $and: [
        { price: { $lt: maxInt ?? Number.MAX_SAFE_INTEGER } },
        { price: { $gt: minInt ?? 0 } },
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
    const skipInt = isSafeNumber(skip) ? parseInt(skip, 10) : 0;

    const limitInt = isSafeNumber(limit) ? parseInt(limit, 10) : Number.MAX_SAFE_INTEGER;

    debug(filter, 'after');
    const products = await Product.find(filter, 'price name user description productType brand')
      .where()
      .sort(sortFilter)
      .skip(skipInt)
      .limit(limitInt)
      .lean()
      .exec();

    const count = await Product.find(filter, '-image').count().exec();
    debug(filter, 'return');
    return res.json({ data: products, count });
  } catch (error) {
    debug(error);
    return next(error);
  }
};

module.exports = {
  searchProducts,
};
