const prisma = require('../lib/prisma');

const getFeatures = async (req, res) => {
  try {
    const features = await prisma.otherFeature.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    const featureMap = {};
    features.forEach(feat => {
      featureMap[feat.id] = { ...feat, _id: feat.id, children: [] };
    });

    const data = [];

    features.forEach(feat => {
      const featWithChildren = featureMap[feat.id];
      if (feat.parentId) {
        const parentIdStr = feat.parentId;
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
    const feature = await prisma.otherFeature.findUnique({
      where: { slug: req.params.slug }
    });

    if (feature && feature.isActive) {
      const children = await prisma.otherFeature.findMany({
        where: { parentId: feature.id, isActive: true },
        orderBy: { name: 'asc' }
      });
      feature.children = children.map(c => ({...c, _id: c.id}));
      feature._id = feature.id;
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
    
    const exists = await prisma.otherFeature.findUnique({ where: { slug } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Feature slug already exists' });
    }

    if (parentId) {
      const parentExists = await prisma.otherFeature.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return res.status(400).json({ success: false, message: 'Parent feature not found' });
      }
    }

    const data = {
      name, slug, description, image, parentId: parentId || null
    };
    if (isActive !== undefined) data.isActive = isActive;

    const feature = await prisma.otherFeature.create({ data });

    res.status(201).json({ success: true, data: { ...feature, _id: feature.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateFeature = async (req, res) => {
  try {
    const { name, slug, description, image, parentId, isActive } = req.body;
    
    let feature = await prisma.otherFeature.findUnique({ where: { id: req.params.id } });
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }

    if (parentId && parentId === feature.id) {
      return res.status(400).json({ success: false, message: 'Feature cannot be its own parent' });
    }

    const data = {};
    if (name) data.name = name;
    if (slug) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (parentId !== undefined) data.parentId = parentId || null;
    if (isActive !== undefined) data.isActive = isActive;

    feature = await prisma.otherFeature.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, data: { ...feature, _id: feature.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteFeature = async (req, res) => {
  try {
    const feature = await prisma.otherFeature.findUnique({ where: { id: req.params.id } });
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }

    const children = await prisma.otherFeature.findMany({ where: { parentId: feature.id } });
    if (children.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete feature with sub-features' });
    }

    await prisma.otherFeature.delete({ where: { id: req.params.id } });
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
