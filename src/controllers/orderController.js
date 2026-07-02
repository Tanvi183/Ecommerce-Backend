const prisma = require('../lib/prisma');

// Compute stock status helper
const computeStockStatus = (stock) => {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 10) return 'low_stock';
  return 'in_stock';
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Verify stock and decrement
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
      }
    }

    // Decrement stock for all items
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      const newStock = product.stock - item.quantity;
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: newStock,
          stockStatus: computeStockStatus(newStock)
        }
      });
    }

    // Create order
    // Ensure item fields match OrderItem type
    const mappedItems = items.map(i => ({
      productId: i.productId,
      name: i.name,
      thumbnail: i.thumbnail,
      slug: i.slug,
      price: Number(i.price),
      quantity: Number(i.quantity)
    }));

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        items: mappedItems,
        shippingAddress: shippingAddress || req.user.address || {},
        paymentMethod,
        total: Number(total),
        status: 'pending',
        paymentStatus: 'unpaid'
      }
    });

    res.status(201).json({ success: true, data: order, message: 'Order created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.order.count({ where: { userId: req.user.id } });

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json({
      success: true,
      data: orders,
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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user only views their own order or is an admin
    if (order.user.id !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    // To be backwards compatible with populated 'userId' field in Mongoose
    const data = { ...order, userId: order.user, user: undefined };

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let where = {};
    if (status) {
        where.status = status;
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    // Map user to userId for frontend compatibility
    const mappedOrders = orders.map(o => ({ ...o, userId: o.user, user: undefined }));

    res.json({
      success: true,
      data: mappedOrders,
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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const existingOrder = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (existingOrder) {
      const data = {};
      if (status) data.status = status;
      if (paymentStatus) data.paymentStatus = paymentStatus;
      
      const updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data
      });
      res.json({ success: true, data: updatedOrder, message: 'Order status updated' });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
