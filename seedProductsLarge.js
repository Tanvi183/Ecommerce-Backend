const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const sampleImages = [
  '/product_wallpaper1.png',
  '/product_floor1.png',
  '/wall_panel_category.png',
  '/glass_paper_category.png',
  '/kitchen_category.png'
];

async function main() {
  console.log('Fetching existing categories and brands...');
  const allCategories = await prisma.category.findMany();
  const allBrands = await prisma.brand.findMany();

  if (allCategories.length === 0) {
    console.error('No categories found! Please seed categories first.');
    process.exit(1);
  }

  // Organize categories
  const rootCategories = allCategories.filter(c => !c.parentId);
  const getSubcategories = (parentId) => allCategories.filter(c => c.parentId === parentId);

  const productsData = [];
  const TOTAL_PRODUCTS = 250;

  console.log(`Generating ${TOTAL_PRODUCTS} products...`);

  for (let i = 0; i < TOTAL_PRODUCTS; i++) {
    // Randomly pick a root category
    const rootCat = rootCategories[Math.floor(Math.random() * rootCategories.length)];
    
    // Check if it has subcategories
    const subs = getSubcategories(rootCat.id);
    const subCat = subs.length > 0 ? subs[Math.floor(Math.random() * subs.length)] : null;
    
    // Check if subcategory has sub-subcategories
    let subSubCat = null;
    if (subCat) {
      const subSubs = getSubcategories(subCat.id);
      subSubCat = subSubs.length > 0 ? subSubs[Math.floor(Math.random() * subSubs.length)] : null;
    }

    const brand = allBrands.length > 0 
      ? allBrands[Math.floor(Math.random() * allBrands.length)] 
      : null;

    const name = faker.commerce.productName();
    const slug = faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(6);
    const price = parseFloat(faker.commerce.price({ min: 50, max: 2000 }));
    
    // 30% chance of being on sale
    const isOnSale = Math.random() > 0.7;
    let originalPrice = null;
    let discountPercent = 0;
    
    if (isOnSale) {
      originalPrice = price + parseFloat(faker.commerce.price({ min: 20, max: 200 }));
      discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const thumbnail = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    const images = [
      thumbnail,
      sampleImages[Math.floor(Math.random() * sampleImages.length)]
    ];

    const stock = faker.number.int({ min: 0, max: 100 });
    let stockStatus = 'in_stock';
    if (stock === 0) stockStatus = 'out_of_stock';
    else if (stock < 10) stockStatus = 'low_stock';

    productsData.push({
      name,
      slug,
      description: faker.commerce.productDescription() + '\\n\\n' + faker.lorem.paragraphs(2),
      shortDescription: faker.commerce.productDescription().substring(0, 150),
      price,
      originalPrice,
      discountPercent,
      isOnSale,
      isNew: Math.random() > 0.8,
      isFeatured: Math.random() > 0.8,
      isBestSeller: Math.random() > 0.8,
      thumbnail,
      images,
      categoryId: rootCat.id,
      subCategoryId: subCat ? subCat.id : null,
      subSubCategoryId: subSubCat ? subSubCat.id : null,
      brandId: brand ? brand.id : null,
      sku: 'SKU-' + faker.string.alphanumeric(8).toUpperCase(),
      stock,
      stockStatus,
      rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
      reviewCount: faker.number.int({ min: 0, max: 150 })
    });
  }

  console.log('Inserting products into database...');
  const result = await prisma.product.createMany({
    data: productsData
  });

  console.log(`Successfully seeded ${result.count} products!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
