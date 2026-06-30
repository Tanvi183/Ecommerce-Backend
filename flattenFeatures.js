require('dotenv').config();
require('mongoose').connect(process.env.MONGO_URI).then(async () => {
  const OtherFeature = require('./src/models/OtherFeature');
  
  // Set all features to have no parentId so they appear as top-level on the flat page
  await OtherFeature.updateMany({}, { $set: { parentId: null } });
  
  // Delete the 'Others Feature' placeholder parent, since they are all just standalone features now
  await OtherFeature.deleteOne({ name: 'Others Feature' });
  
  console.log('Fixed feature hierarchy!');
  process.exit(0);
});
