const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');

dotenv.config();

const floorItemSubcategories = [
  "Artificial Grass",
  "Decking Floor",
  "Floor Carpet",
  "Pvc Coil Mats",
  "PVC Floor",
  "PVC Floor Mats",
  "Pvc Vinyl floor mat",
  "SPC Flooring",
  "Wooden Floor"
];

const floorCarpetSubcategories = [
  "Design Carpet",
  "Hospital Flooring",
  "Non Woven",
  "Solid Carpet",
  "Tiles Carpet"
];

async function seedFloorHierarchy() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // 1. Find the Floor Item category
    const floorItem = await Category.findOne({ name: 'Floor Item' });
    
    if (!floorItem) {
      console.error('Floor Item category not found!');
      process.exit(1);
    }

    console.log(`Found Floor Item category with ID: ${floorItem._id}`);

    // 2. Add Floor Item Subcategories
    for (const subName of floorItemSubcategories) {
      const slug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const exists = await Category.findOne({ slug });
      
      if (!exists) {
        await Category.create({
          name: subName,
          slug: slug,
          parentId: floorItem._id,
          isActive: true,
          description: `Explore our collection of ${subName}`,
          image: '/floor_category.png'
        });
        console.log(`Added subcategory: ${subName}`);
      } else {
        // Ensure it's under Floor Item
        if (exists.parentId?.toString() !== floorItem._id.toString()) {
           exists.parentId = floorItem._id;
           await exists.save();
           console.log(`Moved subcategory under Floor Item: ${subName}`);
        } else {
           console.log(`Subcategory already exists: ${subName}`);
        }
      }
    }

    // 3. Find Floor Carpet category
    const floorCarpetSlug = 'floor-carpet';
    const floorCarpet = await Category.findOne({ slug: floorCarpetSlug });

    if (!floorCarpet) {
      console.error('Floor Carpet category not found! It should have been created above.');
      process.exit(1);
    }

    console.log(`Found Floor Carpet category with ID: ${floorCarpet._id}`);

    // 4. Add Floor Carpet Sub-subcategories
    for (const subName of floorCarpetSubcategories) {
      const slug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const exists = await Category.findOne({ slug });
      
      if (!exists) {
        await Category.create({
          name: subName,
          slug: slug,
          parentId: floorCarpet._id,
          isActive: true,
          description: `Explore our collection of ${subName}`,
          image: '/floor_category.png'
        });
        console.log(`Added sub-subcategory: ${subName}`);
      } else {
        if (exists.parentId?.toString() !== floorCarpet._id.toString()) {
           exists.parentId = floorCarpet._id;
           await exists.save();
           console.log(`Moved sub-subcategory under Floor Carpet: ${subName}`);
        } else {
           console.log(`Sub-subcategory already exists: ${subName}`);
        }
      }
    }

    console.log('Floor hierarchy seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding hierarchy:', error);
    process.exit(1);
  }
}

seedFloorHierarchy();
