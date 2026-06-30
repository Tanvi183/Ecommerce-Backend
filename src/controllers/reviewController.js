const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Review.countDocuments({ productId: req.params.productId });
    
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new review
// @route   POST /api/products/:productId/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      productId,
      userId: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      title,
      body,
      isVerified: true, // Assuming true if they bought it, could be verified elsewhere
    });

    // Recalculate product rating
    const reviews = await Review.find({ productId });
    
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    product.reviewCount = numReviews;
    product.rating = avgRating;
    await product.save();

    res.status(201).json({ success: true, data: review, message: 'Review added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.productId;
    await review.deleteOne();

    // Recalculate product rating
    const product = await Product.findById(productId);
    if (product) {
      const reviews = await Review.find({ productId });
      const numReviews = reviews.length;
      
      product.reviewCount = numReviews;
      product.rating = numReviews > 0 
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
        : 0;
        
      await product.save();
    }

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};
