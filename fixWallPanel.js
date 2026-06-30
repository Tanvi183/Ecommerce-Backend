require('dotenv').config();
require('mongoose').connect(process.env.MONGO_URI).then(async () => {
  const Category = require('./src/models/Category');
  const wp = await Category.findOne({name: 'Wall Panel'});
  if (wp) {
    await Category.updateMany(
      { name: { $in: ['3D Wall Panel', 'Acoustic Panel', 'Charcoal Louver Panel', 'PU Stone Wall Panels', 'WPC'] } },
      { $set: { parentId: wp._id } }
    );
    console.log('Fixed Wall Panel subcategories!');
  }
  process.exit(0);
});
