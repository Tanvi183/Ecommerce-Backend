const prisma = require('../lib/prisma');

// @desc    Get all top-level categories and populate their subcategories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    // Create a map of categories
    const categoryMap = {};
    categories.forEach(cat => {
      // Add _id for backward compatibility with frontend if it expects _id
      categoryMap[cat.id] = { ...cat, _id: cat.id, children: [] };
    });

    const data = [];

    // Build the tree
    categories.forEach(cat => {
      const catWithChildren = categoryMap[cat.id];
      if (cat.parentId) {
        // If it has a parent, add it to the parent's children array
        const parentIdStr = cat.parentId;
        if (categoryMap[parentIdStr]) {
          categoryMap[parentIdStr].children.push(catWithChildren);
        }
      } else {
        // Top-level category
        data.push(catWithChildren);
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug }
    });

    if (category && category.isActive) {
      const children = await prisma.category.findMany({
        where: { parentId: category.id, isActive: true },
        orderBy: { name: 'asc' }
      });
      const data = { ...category, _id: category.id, children: children.map(c => ({...c, _id: c.id})) };
      res.json({ success: true, data });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get sub-categories by parent slug
// @route   GET /api/categories/:slug/subcategories
// @access  Public
const getSubCategoriesByParent = async (req, res) => {
  try {
    const parentCategory = await prisma.category.findUnique({
      where: { slug: req.params.slug }
    });
    
    if (!parentCategory || !parentCategory.isActive) {
      return res.status(404).json({ success: false, message: 'Parent category not found' });
    }

    const subCategories = await prisma.category.findMany({
      where: { parentId: parentCategory.id, isActive: true },
      orderBy: { name: 'asc' }
    });

    // Add _id for backwards compatibility
    const data = subCategories.map(c => ({ ...c, _id: c.id }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, parentId, isActive } = req.body;
    
    const categoryExists = await prisma.category.findUnique({ where: { slug } });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category slug already exists' });
    }

    if (parentId) {
      const parentExists = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return res.status(400).json({ success: false, message: 'Parent category not found' });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    res.status(201).json({ success: true, data: { ...category, _id: category.id }, message: 'Category created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const existingCat = await prisma.category.findUnique({ where: { id: req.params.id } });

    if (existingCat) {
      const data = {
        name: req.body.name || existingCat.name,
        slug: req.body.slug || existingCat.slug,
        description: req.body.description !== undefined ? req.body.description : existingCat.description,
        image: req.body.image || existingCat.image,
        isActive: req.body.isActive !== undefined ? req.body.isActive : existingCat.isActive,
      };
      
      if (req.body.parentId !== undefined) {
        data.parentId = req.body.parentId || null;
      }

      const updatedCategory = await prisma.category.update({
        where: { id: req.params.id },
        data
      });
      res.json({ success: true, data: { ...updatedCategory, _id: updatedCategory.id }, message: 'Category updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });

    if (category) {
      // Check if it has children
      const childrenCount = await prisma.category.count({ where: { parentId: category.id } });
      if (childrenCount > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete category with sub-categories' });
      }

      await prisma.category.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Category removed' });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  getSubCategoriesByParent,
  createCategory,
  updateCategory,
  deleteCategory,
};
