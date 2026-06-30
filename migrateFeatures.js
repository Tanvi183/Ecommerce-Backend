require('dotenv').config();
require('mongoose').connect(process.env.MONGO_URI).then(async () => {
  const Category = require('./src/models/Category');
  const OtherFeature = require('./src/models/OtherFeature');

  const rootFeature = await Category.findOne({ name: 'Others Feature' });
  if (!rootFeature) {
    console.log('No Others Feature found in Categories');
    process.exit(0);
  }

  const newRoot = await OtherFeature.create({
    name: rootFeature.name,
    slug: rootFeature.slug,
    description: rootFeature.description,
    image: rootFeature.image,
    isActive: rootFeature.isActive,
    parentId: null
  });

  const children = await Category.find({ parentId: rootFeature._id });
  for (const child of children) {
    await OtherFeature.create({
      name: child.name,
      slug: child.slug,
      description: child.description,
      image: child.image,
      isActive: child.isActive,
      parentId: newRoot._id
    });
    // Assuming no sub-subcategories for now as per scraper, but we can clean them up if needed
    await Category.findByIdAndDelete(child._id);
  }

  await Category.findByIdAndDelete(rootFeature._id);
  
  console.log('Migrated Others Feature successfully!');
  process.exit(0);
}).catch(console.error);
