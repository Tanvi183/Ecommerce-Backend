const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');

dotenv.config();

const subcategories = [
  "3D Wallpaper",
  "Brick Wallpaper",
  "Colour Bank Tesla",
  "European wallpaper",
  "Floral Wallpaper",
  "Foam Wallpaper",
  "Geometric Wallpaper",
  "Home Wallpaper",
  "Kids Wallpaper",
  "Metallic Wallpaper",
  "P-T VOL-2",
  "Premium-Textured-wallpaper",
  "Textured Wallpaper"
];

async function seedSubcategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find the Wallpaper category
    const wallpaperCategory = await Category.findOne({ name: 'Wallpaper' });
    
    if (!wallpaperCategory) {
      console.error('Wallpaper category not found! Please run the first seed script to add Wallpaper.');
      process.exit(1);
    }

    console.log(`Found Wallpaper category with ID: ${wallpaperCategory._id}`);

    // Create subcategories
    for (const subName of subcategories) {
      // Create a slug
      const slug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      // Check if it already exists to avoid duplicates
      const exists = await Category.findOne({ slug });
      if (!exists) {
        await Category.create({
          name: subName,
          slug: slug,
          parentId: wallpaperCategory._id,
          isActive: true,
          description: `Explore our collection of ${subName}`,
          image: '/wallpaper_category.png' // Defaulting to the parent's image for now
        });
        console.log(`Added subcategory: ${subName}`);
      } else {
        console.log(`Subcategory already exists: ${subName}`);
      }
    }

    console.log('All Wallpaper subcategories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding subcategories:', error);
    process.exit(1);
  }
}

seedSubcategories();
