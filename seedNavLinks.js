require('dotenv').config();
require('mongoose').connect(process.env.MONGO_URI).then(async () => {
  const SiteSetting = require('./src/models/SiteSetting');
  
  const NAV_LINKS = [
    { label: "ALL PRODUCTS", href: "/products" },
    {
      label: "WALLPAPER",
      href: "/wallpaper",
      subLinks: [
        { label: "3D Wallpaper", href: "/categories/3d-wallpaper" },
        { label: "Brick Wallpaper", href: "/categories/brick-wallpaper" },
        { label: "Colour Bank Tesla", href: "/categories/colour-bank-tesla" },
        { label: "European wallpaper", href: "/categories/european-wallpaper" },
        { label: "Floral Wallpaper", href: "/categories/floral-wallpaper" },
        { label: "Foam Wallpaper", href: "/categories/foam-wallpaper" },
        { label: "Geometric Wallpaper", href: "/categories/geometric-wallpaper" },
        { label: "Korean Wallpaper", href: "/categories/korean-wallpaper" },
        { label: "PVC Wallpaper", href: "/categories/pvc-wallpaper" },
        { label: "Stone Wallpaper", href: "/categories/stone-wallpaper" },
        { label: "Textured Wallpaper", href: "/categories/textured-wallpaper" },
        { label: "Vinyl Wallpaper", href: "/categories/vinyl-wallpaper" },
        { label: "Wooden Wallpaper", href: "/categories/wooden-wallpaper" }
      ]
    },
    {
      label: "FLOOR ITEM",
      href: "/floor-item",
      subLinks: [
        { label: "Artificial Grass", href: "/categories/artificial-grass" },
        { label: "Decking Floor", href: "/categories/decking-floor" },
        { label: "Floor Carpet", href: "/categories/floor-carpet" },
        { label: "Floor Mat", href: "/categories/floor-mat" },
        { label: "Floor Runner", href: "/categories/floor-runner" },
        { label: "Rubber Floor", href: "/categories/rubber-floor" },
        { label: "SPC Floor", href: "/categories/spc-floor" },
        { label: "Vinyl Floor", href: "/categories/vinyl-floor" }
      ]
    },
    { label: "BLIND", href: "/blind" },
    { label: "OFFER", href: "/offers", isOffer: true },
    { label: "GLASS PAPER", href: "/glass-paper" },
    {
      label: "WALL PANEL",
      href: "/wall-panel",
      subLinks: [
        { label: "Acoustic Panel", href: "/categories/acoustic-panel" },
        { label: "Charcoal Louver Panel", href: "/categories/charcoal-louver-panel" },
        { label: "PU Stone Wall Panels", href: "/categories/pu-stone-wall-panels" },
        { label: "WPC", href: "/categories/wpc" }
      ]
    },
    { label: "KITCHEN ITEM", href: "/kitchen-item" },
    {
      label: "OTHERS FEATURE",
      href: "/others-feature",
      subLinks: [
        { label: "Artifical Plant", href: "/categories/artifical-plant" },
        { label: "Flexible Soft Stone", href: "/categories/flexible-soft-stone" },
        { label: "Glass Workshop", href: "/categories/glass-workshop" },
        { label: "Metal Workshop", href: "/categories/metal-workshop" },
        { label: "Service", href: "/categories/service" },
        { label: "Steel Strips", href: "/categories/steel-strips" },
        { label: "Table Cover Protector", href: "/categories/table-cover-protector" },
        { label: "Wall Moulding", href: "/categories/wall-moulding" },
        { label: "Wall Shelf", href: "/categories/wall-shelf" },
        { label: "Water Fountain", href: "/categories/water-fountain" }
      ]
    },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({ navLinks: NAV_LINKS });
  } else if (!settings.navLinks || settings.navLinks.length === 0) {
    settings.navLinks = NAV_LINKS;
    await settings.save();
  }
  
  console.log('Seeded navLinks!');
  process.exit(0);
});
