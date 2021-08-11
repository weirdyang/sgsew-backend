const express = require('express');

const router = express.Router();

const { fetchProductImage } = require('../controllers/products.controller');
const { searchProducts } = require('../controllers/search.controller');

router.get('/products', searchProducts);

router.get('/image/:id', fetchProductImage);

module.exports = router;
