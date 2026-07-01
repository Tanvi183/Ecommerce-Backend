require('dotenv').config();
require('mongoose').connect(process.env.MONGO_URI).then(async () => {
  const SiteSetting = require('./src/models/SiteSetting');
  
  const INITIAL_SERVICES = [
    { label: "Wallpaper", href: "/wallpaper" },
    { label: "Floor Item", href: "/floor-item" },
    { label: "Blind", href: "/blind" },
    { label: "Brands", href: "#" },
  ];

  let settings = await SiteSetting.findOne();
  if (settings) {
    if (!settings.footer.services || settings.footer.services.length === 0) {
      settings.footer.services = INITIAL_SERVICES;
      await settings.save();
      console.log('Seeded footer services!');
    } else {
      console.log('Footer services already exist.');
    }
  } else {
    console.log('No settings found. Please save settings once first.');
  }
  
  process.exit(0);
});
