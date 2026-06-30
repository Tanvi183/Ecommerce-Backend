require('dotenv').config();
require('mongoose').connect(process.env.MONGO_URI).then(async () => {
  const Category = require('./src/models/Category');
  
  // Kitchen Items
  const kitchen = await Category.findOne({name: 'Kitchen Item'});
  if (kitchen) {
    await Category.updateMany(
      { name: { $in: ['HPL Sheet', 'Kitchen Cabinet', 'Kitchen Sticker', 'UV Wall sticker'] } },
      { $set: { parentId: kitchen._id } }
    );
    console.log('Fixed Kitchen Item subcategories!');
  }

  // Others Feature
  const others = await Category.findOne({name: 'Others Feature'});
  if (others) {
    await Category.updateMany(
      { name: { $in: ['Artifical Plant', 'Flexible Soft Stone', 'Glass Workshop', 'Metal Workshop', 'Service', 'Steel Strips', 'Table Cover Protector', 'Wall Moulding', 'Wall Shelf', 'Water Fountain'] } },
      { $set: { parentId: others._id } }
    );
    console.log('Fixed Others Feature subcategories!');
  }

  process.exit(0);
});
