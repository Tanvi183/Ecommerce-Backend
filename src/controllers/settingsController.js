const SiteSetting = require('../models/SiteSetting');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      // Create default if none exists
      settings = await SiteSetting.create({});
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
    let settings = await SiteSetting.findOne();
    
    if (settings) {
      // Update
      settings.header = req.body.header || settings.header;
      settings.footer = req.body.footer || settings.footer;
      settings.banners = req.body.banners || settings.banners;
      if (req.body.navLinks !== undefined) {
        settings.navLinks = req.body.navLinks;
      }
      
      const updatedSettings = await settings.save();
      res.json({ success: true, data: updatedSettings });
    } else {
      // Create
      const newSettings = await SiteSetting.create(req.body);
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
