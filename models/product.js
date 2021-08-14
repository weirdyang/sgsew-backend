const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const MAX_PRICE = 10000;
function moreThanZero(value) {
  if (!value) {
    return null;
  }
  if (Number.isNaN(parseFloat(value))) {
    return null;
  }
  return +value > 0;
}
function lessThanMax(value) {
  if (!value) {
    return null;
  }
  if (Number.isNaN(parseFloat(value))) {
    return null;
  }
  return +value <= MAX_PRICE;
}
const priceCheck = [
  moreThanZero,
  'Price must be more than zero',
];

const priceValidators = [
  { validator: moreThanZero, msg: 'Price must be more than zero' },
  { validator: lessThanMax, msg: `Price must be less than ${MAX_PRICE}` },
];
const productTypes = ['hardware', 'services'];
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, 'Product name can not be blank'],
    unique: true,
    minLength: [6, 'Product name needs to be at least 6 characters'],
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Product description can not be blank'],
    unique: false,
    minLength: [6, 'Product description needs to be at least 6 characters'],
    maxLength: [140, 'Product description can not exceed 140 characters'],
  },
  productType: {
    type: String,
    enum: productTypes,
    lowercase: true,
    required: [true, 'Product type can not be blank'],
    unique: false,
    minLength: [6, 'Product type needs to be at least 6 characters'],
  },
  brand: {
    type: String,
    required: [true, 'Brand can not be blank'],
    unique: false,
    minLength: [3, 'Brand name needs to be at least 3 characters'],
  },
  normalizedBrand: {
    type: String,
    lowercase: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    default: 0,
    validate: priceValidators,
  },
  image:
  {
    data: Buffer,
    contentType: String,
  },
  user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

productSchema.plugin(uniqueValidator, { message: '{PATH} already exists in the database' });
const Product = mongoose.model('Product', productSchema);
module.exports = {
  Product,
};
