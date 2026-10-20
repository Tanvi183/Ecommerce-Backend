const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllCustomers,
  getLowStockProducts
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes are protected and require admin role
router.use(protect, admin);

router.route('/stats').get(getDashboardStats);
router.route('/customers').get(getAllCustomers);
router.route('/low-stock').get(getLowStockProducts);

module.exports = router;
