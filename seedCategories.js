const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');

dotenv.config();

const dummyCategories = [
  { id: "c1", name: "Wallpaper",        slug: "wallpaper",       image: "/wallpaper_category.png",       productCount: 124 },
  { id: "c2", name: "Floor Item",       slug: "floor-item",      image: "/floor_category.png",           productCount: 86  },
  { id: "c3", name: "Window Blind",     slug: "blind",           image: "/blind_category.png",           productCount: 63  },
  { id: "c4", name: "Glass Paper",      slug: "glass-paper",     image: "/glass_paper_category.png",     productCount: 48  },
  { id: "c5", name: "Wall Panel",       slug: "wall-panel",      image: "/wall_panel_category.png",      productCount: 55  },
  { id: "c6", name: "Kitchen Sticker",  slug: "kitchen-sticker", image: "/kitchen_sticker_category.png", productCount: 72  },
  { id: "c7", name: "Artificial Grass", slug: "artificial-grass",image: "/artificial_grass.png",         productCount: 34  },
  { id: "c8", name: "UV Wall Sticker",  slug: "uv-wall-sticker", image: "/product_wallpaper1.png",       productCount: 41  },
  { id: "c9", name: "PVC Floor",        slug: "pvc-floor",       image: "/product_floor1.png",           productCount: 29  },
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Optional: Only seed if db is empty or just remove existing
    // Let's remove existing to guarantee a clean slate
    await Category.deleteMany();
    console.log('Cleared existing categories');

    for (const cat of dummyCategories) {
      await Category.create({
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: `Explore our collection of ${cat.name}`,
        isActive: true,
      });
    }

    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedData();
