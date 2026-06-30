const OtherFeature = require('../models/OtherFeature');

const getFeatures = async (req, res) => {
  try {
    const features = await OtherFeature.find({ isActive: true }).sort({ name: 1 }).lean();
    
    const featureMap = {};
    features.forEach(feat => {
      featureMap[feat._id.toString()] = { ...feat, children: [] };
    });

    const data = [];

    features.forEach(feat => {
      const featWithChildren = featureMap[feat._id.toString()];
      if (feat.parentId) {
        const parentIdStr = feat.parentId.toString();
        if (featureMap[parentIdStr]) {
          featureMap[parentIdStr].children.push(featWithChildren);
        }
      } else {
        data.push(featWithChildren);
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getFeatureBySlug = async (req, res) => {
  try {
    const feature = await OtherFeature.findOne({ slug: req.params.slug, isActive: true }).lean();

    if (feature) {
      const children = await OtherFeature.find({ parentId: feature._id, isActive: true }).sort({ name: 1 }).lean();
      feature.children = children;
      res.json({ success: true, data: feature });
    } else {
      res.status(404).json({ success: false, message: 'Feature not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createFeature = async (req, res) => {
  try {
    const { name, slug, description, image, parentId, isActive } = req.body;
    
    const exists = await OtherFeature.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Feature slug already exists' });
    }

    if (parentId) {
      const parentExists = await OtherFeature.findById(parentId);
      if (!parentExists) {
        return res.status(400).json({ success: false, message: 'Parent feature not found' });
      }
    }

    const feature = await OtherFeature.create({
      name, slug, description, image, parentId, isActive
    });

    res.status(201).json({ success: true, data: feature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateFeature = async (req, res) => {
  try {
    const { name, slug, description, image, parentId, isActive } = req.body;
    
    let feature = await OtherFeature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }

    if (parentId && parentId.toString() === feature._id.toString()) {
      return res.status(400).json({ success: false, message: 'Feature cannot be its own parent' });
    }

    feature = await OtherFeature.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, image, parentId, isActive },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: feature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteFeature = async (req, res) => {
  try {
    const feature = await OtherFeature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }

    const children = await OtherFeature.find({ parentId: feature._id });
    if (children.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete feature with sub-features' });
    }

    await OtherFeature.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feature removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getFeatures,
  getFeatureBySlug,
  createFeature,
  updateFeature,
  deleteFeature
};
