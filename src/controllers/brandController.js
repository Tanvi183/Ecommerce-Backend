const prisma = require('../lib/prisma');

// @desc    Get all active brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    // Add _id for backwards compatibility
    const data = brands.map(b => ({ ...b, _id: b.id }));
    res.json({ success: true, data });
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
    const brand = await prisma.brand.findUnique({
      where: { slug: req.params.slug }
    });
    if (brand && brand.isActive) {
      res.json({ success: true, data: { ...brand, _id: brand.id } });
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
    const brandExists = await prisma.brand.findUnique({ where: { slug } });

    if (brandExists) {
      return res.status(400).json({ success: false, message: 'Brand slug already exists' });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo,
        href,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    res.status(201).json({ success: true, data: { ...brand, _id: brand.id }, message: 'Brand created successfully' });
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
    const existingBrand = await prisma.brand.findUnique({ where: { id: req.params.id } });

    if (existingBrand) {
      const data = {
        name: req.body.name || existingBrand.name,
        slug: req.body.slug || existingBrand.slug,
        logo: req.body.logo || existingBrand.logo,
        href: req.body.href !== undefined ? req.body.href : existingBrand.href,
        isActive: req.body.isActive !== undefined ? req.body.isActive : existingBrand.isActive,
      };

      const updatedBrand = await prisma.brand.update({
        where: { id: req.params.id },
        data
      });
      res.json({ success: true, data: { ...updatedBrand, _id: updatedBrand.id }, message: 'Brand updated successfully' });
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
    const brand = await prisma.brand.findUnique({ where: { id: req.params.id } });

    if (brand) {
      await prisma.brand.delete({ where: { id: req.params.id } });
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
