const Category = require('../models/Category');

// @desc    Get all top-level categories and populate their subcategories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    
    // Create a map of categories
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = { ...cat, children: [] };
    });

    const data = [];

    // Build the tree
    categories.forEach(cat => {
      const catWithChildren = categoryMap[cat._id.toString()];
      if (cat.parentId) {
        // If it has a parent, add it to the parent's children array
        const parentIdStr = cat.parentId.toString();
        if (categoryMap[parentIdStr]) {
          categoryMap[parentIdStr].children.push(catWithChildren);
        } else {
          // If parent is not active/found, we might treat it as top-level or just ignore. 
          // Ignoring for now to maintain strict tree structure.
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
    const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();

    if (category) {
      const children = await Category.find({ parentId: category._id, isActive: true }).sort({ name: 1 }).lean();
      category.children = children;
      res.json({ success: true, data: category });
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
    const parentCategory = await Category.findOne({ slug: req.params.slug, isActive: true });
    
    if (!parentCategory) {
      return res.status(404).json({ success: false, message: 'Parent category not found' });
    }

    const subCategories = await Category.find({ parentId: parentCategory._id, isActive: true })
      .sort({ name: 1 });

    res.json({ success: true, data: subCategories });
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
    
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category slug already exists' });
    }

    if (parentId) {
      const parentExists = await Category.findById(parentId);
      if (!parentExists) {
        return res.status(400).json({ success: false, message: 'Parent category not found' });
      }
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentId: parentId || null,
      isActive,
    });

    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
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
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.slug || category.slug;
      category.description = req.body.description !== undefined ? req.body.description : category.description;
      category.image = req.body.image || category.image;
      category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;
      
      if (req.body.parentId !== undefined) {
          category.parentId = req.body.parentId || null;
      }

      const updatedCategory = await category.save();
      res.json({ success: true, data: updatedCategory, message: 'Category updated successfully' });
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
    const category = await Category.findById(req.params.id);

    if (category) {
      // Check if it has children
      const childrenCount = await Category.countDocuments({ parentId: category._id });
      if (childrenCount > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete category with sub-categories' });
      }

      await category.deleteOne();
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
