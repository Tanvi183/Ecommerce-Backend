const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

const dummyBrands = [
  { id: "b1", name: "DecorPro",     logo: "/wallpaper_category.png",       href: "#" },
  { id: "b2", name: "FloorMaster",  logo: "/floor_category.png",           href: "#" },
  { id: "b3", name: "SunShade",     logo: "/blind_category.png",           href: "#" },
  { id: "b4", name: "GlassDecor",   logo: "/glass_paper_category.png",     href: "#" },
  { id: "b5", name: "PanelArt",     logo: "/wall_panel_category.png",      href: "#" },
  { id: "b6", name: "KitchenStyle", logo: "/kitchen_sticker_category.png", href: "#" },
];

const dummyProducts = [
  {
    id: "p1", name: "Flexible Soft Stone Wallpaper", slug: "flexible-soft-stone-wallpaper",
    description: "Premium 3D soft stone texture wallpaper for elegant interiors.",
    shortDescription: "3D stone texture wallpaper, waterproof and peel-safe.",
    price: 2800, originalPrice: 3500, discountPercent: 20,
    images: ["/product_wallpaper1.png", "/wallpaper_category.png"],
    thumbnail: "/product_wallpaper1.png",
    categoryId: "c1", categoryObj: dummyCategories[0],
    tags: ["wallpaper", "3d", "stone"], sku: "WP-001", stock: 50,
    rating: 4.7, reviewCount: 128, isNew: true, isFeatured: true,
    brand: "DecorPro"
  },
  {
    id: "p2", name: "Premium SPC Oak Floor", slug: "premium-spc-oak-floor",
    description: "Waterproof SPC vinyl plank flooring with warm oak finish.",
    shortDescription: "Waterproof SPC, scratch-resistant, easy install.",
    price: 3500, originalPrice: 4200, discountPercent: 17,
    images: ["/product_floor1.png", "/floor_category.png"],
    thumbnail: "/product_floor1.png",
    categoryId: "c2", categoryObj: dummyCategories[1],
    tags: ["floor", "spc", "waterproof"], sku: "FL-001", stock: 35,
    rating: 4.8, reviewCount: 97, isNew: true, isBestSeller: true,
    brand: "FloorMaster"
  },
  {
    id: "p3", name: "Zebra Roller Blind", slug: "zebra-roller-blind",
    description: "Premium zebra roller blind with day/night light control.",
    shortDescription: "Day-night roller blind, modern striped design.",
    price: 1200, originalPrice: 1500, discountPercent: 20,
    images: ["/product_blind1.png", "/blind_category.png"],
    thumbnail: "/product_blind1.png",
    categoryId: "c3", categoryObj: dummyCategories[2],
    tags: ["blind", "zebra", "roller"], sku: "BL-001", stock: 80,
    rating: 4.6, reviewCount: 64, isNew: true,
    brand: "SunShade"
  },
  {
    id: "p4", name: "3D Wave Wall Panel", slug: "3d-wave-wall-panel",
    description: "Architectural 3D wave-pattern wall paneling for modern spaces.",
    shortDescription: "Lightweight, moisture-resistant 3D wall panel.",
    price: 2200, originalPrice: 2800, discountPercent: 21,
    images: ["/wall_panel_category.png"],
    thumbnail: "/wall_panel_category.png",
    categoryId: "c5", categoryObj: dummyCategories[4],
    tags: ["wall-panel", "3d", "modern"], sku: "WP-003", stock: 45,
    rating: 4.9, reviewCount: 42, isNew: true, isFeatured: true,
    brand: "PanelArt"
  },
  {
    id: "p5", name: "Frosted Glass Sticker Film", slug: "frosted-glass-sticker",
    description: "Privacy frosted film for windows, doors and partitions.",
    shortDescription: "Easy peel-stick, UV-resistant frosted film.",
    price: 850, originalPrice: 1100, discountPercent: 23,
    images: ["/glass_paper_category.png"],
    thumbnail: "/glass_paper_category.png",
    categoryId: "c4", categoryObj: dummyCategories[3],
    tags: ["glass", "frosted", "privacy"], sku: "GP-001", stock: 120,
    rating: 4.5, reviewCount: 88, isNew: true, isOnSale: true,
    brand: "GlassDecor"
  },
  {
    id: "p6", name: "Artificial Sport Turf Grass", slug: "artificial-sport-turf",
    description: "Premium artificial turf for balconies, gardens and sports courts.",
    shortDescription: "UV-resistant, dense, soft-feel artificial grass.",
    price: 200, originalPrice: 280, discountPercent: 29,
    images: ["/artificial_grass.png"],
    thumbnail: "/artificial_grass.png",
    categoryId: "c7", categoryObj: dummyCategories[6],
    tags: ["grass", "outdoor", "sport"], sku: "AG-001", stock: 200,
    rating: 4.4, reviewCount: 55, isNew: true, isHot: true,
    brand: "GreenLife"
  },
  {
    id: "p7", name: "Marble Kitchen Cabinet Sticker", slug: "marble-kitchen-cabinet-sticker",
    description: "Self-adhesive marble-pattern vinyl for kitchen cabinets and countertops.",
    shortDescription: "Heat-resistant, waterproof vinyl cabinet wrap.",
    price: 680, originalPrice: 900, discountPercent: 24,
    images: ["/kitchen_sticker_category.png"],
    thumbnail: "/kitchen_sticker_category.png",
    categoryId: "c6", categoryObj: dummyCategories[5],
    tags: ["kitchen", "sticker", "marble"], sku: "KS-001", stock: 95,
    rating: 4.3, reviewCount: 73, isHot: true, isOnSale: true,
    brand: "KitchenStyle"
  },
  {
    id: "p8", name: "Floral Botanical Wallpaper", slug: "floral-botanical-wallpaper",
    description: "Elegant botanical floral print wallpaper for living rooms and bedrooms.",
    shortDescription: "Lush botanical pattern, fade-resistant, easy paste.",
    price: 1800, originalPrice: 2200, discountPercent: 18,
    images: ["/wallpaper_category.png", "/product_wallpaper1.png"],
    thumbnail: "/wallpaper_category.png",
    categoryId: "c1", categoryObj: dummyCategories[0],
    tags: ["wallpaper", "floral", "botanical"], sku: "WP-002", stock: 60,
    rating: 4.6, reviewCount: 112, isBestSeller: true,
    brand: "NatureWall"
  },
  {
    id: "p9", name: "Premium Wood Plank Floor", slug: "premium-wood-plank-floor",
    description: "Authentic-feel engineered wood plank flooring for premium interiors.",
    shortDescription: "Click-lock, 8mm thick, easy DIY install.",
    price: 4200, originalPrice: 5000, discountPercent: 16,
    images: ["/floor_category.png"],
    thumbnail: "/floor_category.png",
    categoryId: "c2", categoryObj: dummyCategories[1],
    tags: ["floor", "wood", "engineered"], sku: "FL-002", stock: 28,
    rating: 4.9, reviewCount: 43, isFeatured: true, isBestSeller: true,
    brand: "WoodCraft"
  },
  {
    id: "p10", name: "3D Wallpaper Design — Galaxy", slug: "3d-wallpaper-galaxy",
    description: "Stunning cosmic galaxy 3D effect wallpaper, perfect for feature walls.",
    shortDescription: "Galaxy-print, vivid colours, high-res texture.",
    price: 1500, originalPrice: 1900, discountPercent: 21,
    images: ["/product_wallpaper1.png"],
    thumbnail: "/product_wallpaper1.png",
    categoryId: "c1", categoryObj: dummyCategories[0],
    tags: ["wallpaper", "3d", "galaxy"], sku: "WP-004", stock: 70,
    rating: 4.7, reviewCount: 86, isOnSale: true,
    brand: "CosmicDecor"
  },
  {
    id: "p11", name: "PVC Wooden Floor Tile", slug: "pvc-wooden-floor-tile",
    description: "Interlocking PVC floor tiles with realistic wood grain texture.",
    shortDescription: "Waterproof, anti-slip, click-fit PVC tiles.",
    price: 950, originalPrice: 1200, discountPercent: 21,
    images: ["/product_floor1.png"],
    thumbnail: "/product_floor1.png",
    categoryId: "c9", categoryObj: dummyCategories[8],
    tags: ["pvc", "floor", "tile"], sku: "PF-001", stock: 110,
    rating: 4.5, reviewCount: 67, isHot: true,
    brand: "TilePro"
  },
  {
    id: "p12", name: "UV Printed Brick Wall Sticker", slug: "uv-brick-wall-sticker",
    description: "Realistic brick-texture UV-printed peel-and-stick wall art.",
    shortDescription: "Peel-stick, reusable, UV-printed brick decal.",
    price: 990, originalPrice: 1300, discountPercent: 24,
    images: ["/product_wallpaper1.png"],
    thumbnail: "/product_wallpaper1.png",
    categoryId: "c8", categoryObj: dummyCategories[7],
    tags: ["uv", "brick", "sticker"], sku: "UV-001", stock: 55,
    rating: 4.4, reviewCount: 49,
    brand: "ArtWall"
  }
];

async function seed() {
  console.log("Starting seeding process...");

  // Seed Categories
  const categoryMap = {};
  for (const cat of dummyCategories) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        image: cat.image
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: "",
        isActive: true
      }
    });
    categoryMap[cat.slug] = createdCat.id;
  }
  console.log("Categories seeded successfully.");

  // Seed Brands
  const brandMap = {};
  for (const brand of dummyBrands) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      update: {
        name: brand.name,
        logo: brand.logo
      },
      create: {
        name: brand.name,
        slug: brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: brand.logo,
        isActive: true
      }
    });
    brandMap[brand.name] = createdBrand.id;
  }
  console.log("Brands seeded successfully.");

  // Seed Products
  for (const prod of dummyProducts) {
    
    // Find category ID from categoryMap
    const catId = categoryMap[prod.categoryObj.slug];
    
    // Find brand ID from brandMap
    const brId = brandMap[prod.brand];

    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        originalPrice: prod.originalPrice,
        discountPercent: prod.discountPercent,
        images: prod.images,
        thumbnail: prod.thumbnail,
        categoryId: catId,
        brandId: brId,
        tags: prod.tags,
        stock: prod.stock,
        stockStatus: prod.stock > 0 ? "in_stock" : "out_of_stock",
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        isNew: prod.isNew || false,
        isHot: prod.isHot || false,
        isFeatured: prod.isFeatured || false,
        isBestSeller: prod.isBestSeller || false,
        isOnSale: prod.isOnSale || false,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        originalPrice: prod.originalPrice,
        discountPercent: prod.discountPercent,
        images: prod.images,
        thumbnail: prod.thumbnail,
        categoryId: catId,
        brandId: brId,
        tags: prod.tags,
        sku: prod.sku,
        stock: prod.stock,
        stockStatus: prod.stock > 0 ? "in_stock" : "out_of_stock",
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        isNew: prod.isNew || false,
        isHot: prod.isHot || false,
        isFeatured: prod.isFeatured || false,
        isBestSeller: prod.isBestSeller || false,
        isOnSale: prod.isOnSale || false,
      }
    });
  }
  console.log("Products seeded successfully.");
  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
