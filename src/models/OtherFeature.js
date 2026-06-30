const mongoose = require('mongoose');

const otherFeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OtherFeature',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('OtherFeature', otherFeatureSchema);
