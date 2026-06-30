const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cheerio = require('cheerio');
const Category = require('./src/models/Category');

dotenv.config();

const filePath = 'C:\\Users\\Tanvi\\.gemini\\antigravity-ide\\brain\\5b09435a-508d-4f1c-a7a8-44566ed75d78\\.system_generated\\steps\\474\\content.md';

async function seedDecornCultureCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    const menuItems = [];

    // Specifically target the desktop main menu to avoid duplicates from mobile menu
    $('.desktop-main-menu-wrapper .main-menu > .j-menu > .menu-item').each((i, el) => {
      const topCategoryName = $(el).children('a').find('.links-text').text().trim() || $(el).children('a').text().trim();
      if (!topCategoryName) return;

      const topCat = {
        name: topCategoryName,
        subcategories: []
      };

      // Find subcategories
      $(el).find('.dropdown-menu > .j-menu > .menu-item').each((j, subEl) => {
        const subName = $(subEl).children('a').find('.links-text').text().trim() || $(subEl).children('a').text().trim();
        if (!subName) return;

        const subCat = {
          name: subName,
          subcategories: []
        };

        // Find sub-subcategories
        $(subEl).find('.dropdown-menu > .j-menu > .menu-item').each((k, subSubEl) => {
          const subSubName = $(subSubEl).children('a').find('.links-text').text().trim() || $(subSubEl).children('a').text().trim();
          if (subSubName) {
            subCat.subcategories.push({ name: subSubName });
          }
        });

        topCat.subcategories.push(subCat);
      });

      menuItems.push(topCat);
    });

    const excludeList = ['About', 'Delivery Info', 'Terms & Conditions', 'Privacy Policy', 'Contact', 'Login', 'Register'];

    async function processCategory(catData, parentId = null) {
      if (excludeList.includes(catData.name)) return;

      const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let category = await Category.findOne({ slug });

      if (!category) {
        category = await Category.create({
          name: catData.name,
          slug: slug,
          parentId: parentId,
          isActive: true,
          description: `Explore our collection of ${catData.name}`
        });
        console.log(`Created: ${catData.name}`);
      } else {
        if (parentId && (!category.parentId || category.parentId.toString() !== parentId.toString())) {
          category.parentId = parentId;
          await category.save();
          console.log(`Moved: ${catData.name} under parent ${parentId}`);
        } else {
          console.log(`Already exists: ${catData.name}`);
        }
      }

      if (catData.subcategories && catData.subcategories.length > 0) {
        for (const sub of catData.subcategories) {
          await processCategory(sub, category._id);
        }
      }
    }

    console.log(`Extracted ${menuItems.length} top-level categories.`);
    
    for (const item of menuItems) {
      await processCategory(item);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedDecornCultureCategories();
