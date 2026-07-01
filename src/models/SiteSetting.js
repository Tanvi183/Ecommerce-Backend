const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  id: { type: String }, // optional identifier for frontend
  image: { type: String, required: true },
  title: { type: String },
  subtitle: { type: String },
  link: { type: String }
});

const navLinkSchema = new mongoose.Schema({
  id: { type: String },
  label: { type: String, required: true },
  href: { type: String, required: true },
  isOffer: { type: Boolean, default: false },
  subLinks: [{
    label: { type: String },
    href: { type: String }
  }]
});

const siteSettingSchema = new mongoose.Schema({
  // Since it's a singleton, we can just enforce an ID or let it findOne()
  header: {
    logo: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
  },
  footer: {
    aboutText: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    services: [{
      label: { type: String },
      href: { type: String }
    }]
  },
  banners: [bannerSchema],
  navLinks: [navLinkSchema]
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
