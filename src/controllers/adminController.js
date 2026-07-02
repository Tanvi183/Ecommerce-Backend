const prisma = require('../lib/prisma');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // Calculate total revenue from delivered orders
    const deliveredOrders = await prisma.order.findMany({ where: { status: 'delivered' } });
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.total, 0);

    // Get low stock products count
    const lowStockCount = await prisma.product.count({ where: { stockStatus: { in: ['low_stock', 'out_of_stock'] } } });

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
    const skip = (page - 1) * limit;

    const where = { role: 'CUSTOMER' };
    const total = await prisma.user.count({ where });

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        newsletter: true,
        address: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

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
    const products = await prisma.product.findMany({
      where: { stockStatus: { in: ['low_stock', 'out_of_stock'] } },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        stock: true,
        stockStatus: true,
        thumbnail: true,
        price: true
      },
      orderBy: { stock: 'asc' }
    });

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
