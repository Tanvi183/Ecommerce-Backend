const prisma = require('../lib/prisma');

// @desc    Get all products (with pagination, filtering, sorting)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, subCategory, brand, minPrice, maxPrice, rating, inStock, search, sort, isOnSale } = req.query;
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    // Build where object
    let where = {};

    // Filter by Category slug
    if (category) {
      where.category = { slug: category };
    }

    // Filter by SubCategory slug
    if (subCategory) {
      where.subCategory = { slug: subCategory };
    }

    // Filter by Brand slug
    if (brand) {
      where.brand = { slug: brand };
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // Rating
    if (rating) {
      where.rating = { gte: Number(rating) };
    }

    // Offers
    if (isOnSale === 'true') {
      where.isOnSale = true;
    } else if (isOnSale === 'false') {
      where.isOnSale = false;
    }

    // Stock Status
    if (inStock === 'true') {
      where.stockStatus = { in: ['in_stock', 'low_stock'] };
    } else if (inStock === 'false') {
      where.stockStatus = 'out_of_stock';
    }

    // Search (name, sku, tags)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    // Sorting
    let orderBy = { createdAt: 'desc' }; // default newest
    if (sort) {
      switch (sort) {
        case 'price-asc':
          orderBy = { price: 'asc' };
          break;
        case 'price-desc':
          orderBy = { price: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'popular':
          orderBy = [
            { reviewCount: 'desc' },
            { rating: 'desc' }
          ];
          break;
        case 'name-asc':
          orderBy = { name: 'asc' };
          break;
        case 'name-desc':
          orderBy = { name: 'desc' };
          break;
      }
    }

    // Execute query
    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        subCategory: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } }
      },
      orderBy,
      skip,
      take: limit
    });

    res.json({
      success: true,
      data: products,
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

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { name: true, slug: true } },
        subCategory: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true, logo: true } }
      }
    });

    if (product) {
      res.json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get related products (same category, exclude current)
// @route   GET /api/products/:slug/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const currentProduct = await prisma.product.findUnique({
      where: { slug: req.params.slug }
    });
    
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        id: { not: currentProduct.id }
      },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } }
      }
    });

    res.json({ success: true, data: related });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper for flagged products
const getFlaggedProducts = async (req, res, flag) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const where = { [flag]: true };
    const total = await prisma.product.count({ where });
    
    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json({
      success: true,
      data: products,
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

const getFeaturedProducts = (req, res) => getFlaggedProducts(req, res, 'isFeatured');
const getNewArrivals = (req, res) => getFlaggedProducts(req, res, 'isNew');
const getBestSellers = (req, res) => getFlaggedProducts(req, res, 'isBestSeller');
const getOnSaleProducts = (req, res) => getFlaggedProducts(req, res, 'isOnSale');

// Compute stock status helper
const computeStockStatus = (stock) => {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 10) return 'low_stock';
  return 'in_stock';
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const productExists = await prisma.product.findUnique({ where: { slug: req.body.slug } });
    if (productExists) {
      return res.status(400).json({ success: false, message: 'Product slug already exists' });
    }

    const data = { ...req.body };
    if (data.stock !== undefined) {
      data.stockStatus = computeStockStatus(data.stock);
    }

    const product = await prisma.product.create({ data });
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.stock !== undefined) {
      data.stockStatus = computeStockStatus(data.stock);
    }

    // prisma update will throw error if not found, so we check first or just try-catch
    const productExists = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
const updateProductStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let newStock = product.stock;
    if (operation === 'set') {
      newStock = Number(quantity);
    } else if (operation === 'increment') {
      newStock += Number(quantity);
    } else if (operation === 'decrement') {
      newStock = Math.max(0, newStock - Number(quantity));
    } else {
      return res.status(400).json({ success: false, message: 'Invalid operation' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        stock: newStock,
        stockStatus: computeStockStatus(newStock)
      }
    });

    res.json({ success: true, data: updatedProduct, message: 'Stock updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (product) {
      await prisma.product.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Product removed' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
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
};
