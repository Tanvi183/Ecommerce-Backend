const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getOnSaleProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/on-sale', getOnSaleProducts);

router.route('/:slug').get(getProductBySlug);
router.route('/:slug/related').get(getRelatedProducts);

router.route('/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/stock')
  .patch(protect, admin, updateProductStock);

module.exports = router;
