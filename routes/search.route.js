const express = require('express');
const { query } = require('express-validator');

const router = express.Router();

const { fetchProductImage } = require('../controllers/products.controller');
const { searchProducts } = require('../controllers/search.controller');

router.get('/products',
  [query('keyword').escape(),
    query('skip').toInt(),
    query('limit').toInt()],
  searchProducts);

router.get('/image/:id', fetchProductImage);

module.exports = router;
