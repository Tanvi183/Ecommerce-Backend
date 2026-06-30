const express = require('express');
const router = express.Router({ mergeParams: true }); 
// mergeParams required because the route will be mounted at /api/products/:productId/reviews
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Base route: /api/products/:productId/reviews
// We'll also mount it directly on /api/reviews for delete

router.route('/')
  .get(getProductReviews)
  .post(protect, createReview);

// Route for deleting review by review ID (mounted on /api/reviews)
router.route('/:id').delete(protect, admin, deleteReview);

module.exports = router;
