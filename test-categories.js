const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
  const cats = await Category.find({ parentId: null }).populate('children').lean();
  console.log(JSON.stringify(cats, null, 2));
  process.exit(0);
}

test();
