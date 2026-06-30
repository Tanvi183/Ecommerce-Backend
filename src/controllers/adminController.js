const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // Calculate total revenue from delivered orders
    const deliveredOrders = await Order.find({ status: 'delivered' });
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.total, 0);

    // Get low stock products count
    const lowStockCount = await Product.countDocuments({ stockStatus: { $in: ['low_stock', 'out_of_stock'] } });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalCategories,
        totalCustomers,
        totalRevenue,
        lowStockCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { role: 'CUSTOMER' };
    const total = await User.countDocuments(query);

    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get low stock products
// @route   GET /api/admin/low-stock
// @access  Private/Admin
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stockStatus: { $in: ['low_stock', 'out_of_stock'] } })
      .select('name slug sku stock stockStatus thumbnail price')
      .sort({ stock: 1 });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllCustomers,
  getLowStockProducts
};
