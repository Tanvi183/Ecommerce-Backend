const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

// @desc    Get all products (with pagination, filtering, sorting)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, subCategory, brand, minPrice, maxPrice, rating, inStock, search, sort, isOnSale } = req.query;
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const startIndex = (page - 1) * limit;

    // Build query object
    let query = {};

    // Filter by Category slug
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) query.category = categoryDoc._id;
    }

    // Filter by SubCategory slug
    if (subCategory) {
      const subCategoryDoc = await Category.findOne({ slug: subCategory });
      if (subCategoryDoc) query.subCategory = subCategoryDoc._id;
    }

    // Filter by Brand slug
    if (brand) {
      const brandDoc = await Brand.findOne({ slug: brand });
      if (brandDoc) query.brand = brandDoc._id;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Offers
    if (isOnSale === 'true') {
      query.isOnSale = true;
    } else if (isOnSale === 'false') {
      query.isOnSale = false;
    }

    // Stock Status
    if (inStock === 'true') {
      query.stockStatus = { $in: ['in_stock', 'low_stock'] };
    } else if (inStock === 'false') {
      query.stockStatus = 'out_of_stock';
    }

    // Search (name, sku, tags)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // default newest
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortObj = { price: 1 };
          break;
        case 'price-desc':
          sortObj = { price: -1 };
          break;
        case 'newest':
          sortObj = { createdAt: -1 };
          break;
        case 'popular':
          sortObj = { reviewCount: -1, rating: -1 };
          break;
        case 'name-asc':
          sortObj = { name: 1 };
          break;
        case 'name-desc':
          sortObj = { name: -1 };
          break;
      }
    }

    // Execute query
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('brand', 'name slug')
      .sort(sortObj)
      .skip(startIndex)
      .limit(limit);

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
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('brand', 'name slug logo');

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
    const currentProduct = await Product.findOne({ slug: req.params.slug });
    
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id }
    })
      .limit(8)
      .populate('category', 'name slug');

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
    const startIndex = (page - 1) * limit;

    const query = { [flag]: true };
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

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

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const productExists = await Product.findOne({ slug: req.body.slug });
    if (productExists) {
      return res.status(400).json({ success: false, message: 'Product slug already exists' });
    }

    const product = await Product.create(req.body);
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (product) {
      res.json({ success: true, data: product, message: 'Product updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (operation === 'set') {
      product.stock = Number(quantity);
    } else if (operation === 'increment') {
      product.stock += Number(quantity);
    } else if (operation === 'decrement') {
      product.stock = Math.max(0, product.stock - Number(quantity));
    } else {
      return res.status(400).json({ success: false, message: 'Invalid operation' });
    }

    // stockStatus is automatically updated via pre-save hook in the model
    await product.save();
    res.json({ success: true, data: product, message: 'Stock updated successfully' });
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
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
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
