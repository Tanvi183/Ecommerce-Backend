const prisma = require('../lib/prisma');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await prisma.siteSetting.findFirst();
    if (!settings) {
      // Create default if none exists
      settings = await prisma.siteSetting.create({ data: {} });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await prisma.siteSetting.findFirst();
    
    if (settings) {
      const data = {};
      if (req.body.header !== undefined) data.header = req.body.header;
      if (req.body.footer !== undefined) data.footer = req.body.footer;
      if (req.body.banners !== undefined) data.banners = req.body.banners;
      if (req.body.navLinks !== undefined) data.navLinks = req.body.navLinks;
      
      const updatedSettings = await prisma.siteSetting.update({
        where: { id: settings.id },
        data
      });
      res.json({ success: true, data: updatedSettings });
    } else {
      // Create
      const data = {
        header: req.body.header || undefined,
        footer: req.body.footer || undefined,
        banners: req.body.banners || [],
        navLinks: req.body.navLinks || [],
      };
      const newSettings = await prisma.siteSetting.create({ data });
      res.status(201).json({ success: true, data: newSettings });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
