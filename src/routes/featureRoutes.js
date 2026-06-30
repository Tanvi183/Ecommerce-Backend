const express = require('express');
const router = express.Router();
const {
  getFeatures,
  getFeatureBySlug,
  createFeature,
  updateFeature,
  deleteFeature
} = require('../controllers/featureController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getFeatures)
  .post(protect, admin, createFeature);

router.route('/:id')
  .put(protect, admin, updateFeature)
  .delete(protect, admin, deleteFeature);

router.route('/slug/:slug')
  .get(getFeatureBySlug);

module.exports = router;
