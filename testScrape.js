const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const filePath = 'C:\\Users\\Tanvi\\.gemini\\antigravity-ide\\brain\\5b09435a-508d-4f1c-a7a8-44566ed75d78\\.system_generated\\steps\\474\\content.md';
const html = fs.readFileSync(filePath, 'utf8');

const $ = cheerio.load(html);

// Find the main navigation. It's often in a nav tag, or elements with class like menu, navigation, navbar, etc.
// Since it's OpenCart Journal theme, it's usually inside `.main-menu` or `.j-menu`.
const menuItems = [];

$('.j-menu > .menu-item').each((i, el) => {
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

console.log(JSON.stringify(menuItems, null, 2));
