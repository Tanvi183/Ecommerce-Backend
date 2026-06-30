const Brand = require('../models/Brand');

// @desc    Get all active brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get brand by slug
// @route   GET /api/brands/:slug
// @access  Public
const getBrandBySlug = async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
    if (brand) {
      res.json({ success: true, data: brand });
    } else {
      res.status(404).json({ success: false, message: 'Brand not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = async (req, res) => {
  try {
    const { name, slug, logo, href, isActive } = req.body;
    const brandExists = await Brand.findOne({ slug });

    if (brandExists) {
      return res.status(400).json({ success: false, message: 'Brand slug already exists' });
    }

    const brand = await Brand.create({
      name,
      slug,
      logo,
      href,
      isActive,
    });

    res.status(201).json({ success: true, data: brand, message: 'Brand created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (brand) {
      brand.name = req.body.name || brand.name;
      brand.slug = req.body.slug || brand.slug;
      brand.logo = req.body.logo || brand.logo;
      brand.href = req.body.href !== undefined ? req.body.href : brand.href;
      brand.isActive = req.body.isActive !== undefined ? req.body.isActive : brand.isActive;

      const updatedBrand = await brand.save();
      res.json({ success: true, data: updatedBrand, message: 'Brand updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Brand not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (brand) {
      await brand.deleteOne();
      res.json({ success: true, message: 'Brand removed' });
    } else {
      res.status(404).json({ success: false, message: 'Brand not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
};
