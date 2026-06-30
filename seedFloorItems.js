const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');

dotenv.config();

const subcategories = [
  "Artificial Grass",
  "Decking Floor",
  "Floor Carpet",
  "Floor Mat",
  "Floor Runner",
  "Rubber Floor",
  "SPC Floor",
  "Vinyl Floor"
];

async function seedFloorSubcategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find the Floor Item category
    const parentCategory = await Category.findOne({ name: 'Floor Item' });
    
    if (!parentCategory) {
      console.error('Floor Item category not found!');
      process.exit(1);
    }

    console.log(`Found Floor Item category with ID: ${parentCategory._id}`);

    // Create subcategories
    for (const subName of subcategories) {
      const slug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const exists = await Category.findOne({ slug });
      if (!exists) {
        await Category.create({
          name: subName,
          slug: slug,
          parentId: parentCategory._id,
          isActive: true,
          description: `Explore our collection of ${subName}`,
          image: '/floor_category.png'
        });
        console.log(`Added subcategory: ${subName}`);
      } else {
        console.log(`Subcategory already exists: ${subName}`);
      }
    }

    console.log('All Floor Item subcategories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding subcategories:', error);
    process.exit(1);
  }
}

seedFloorSubcategories();
