const prisma = require('../lib/prisma');

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.review.count({ where: { productId: req.params.productId } });
    
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: {
        user: { select: { name: true } } // avatar not in Prisma User model but userName is in review
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

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

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: req.user.id
        }
      }
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        userName: req.user.name,
        rating: Number(rating),
        title,
        body,
        isVerified: true, 
      }
    });

    // Recalculate product rating
    const reviews = await prisma.review.findMany({ where: { productId } });
    
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await prisma.product.update({
      where: { id: productId },
      data: {
        reviewCount: numReviews,
        rating: avgRating
      }
    });

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
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.productId;
    await prisma.review.delete({ where: { id: req.params.id } });

    // Recalculate product rating
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product) {
      const reviews = await prisma.review.findMany({ where: { productId } });
      const numReviews = reviews.length;
      
      const newRating = numReviews > 0 
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
        : 0;
        
      await prisma.product.update({
        where: { id: productId },
        data: {
          reviewCount: numReviews,
          rating: newRating
        }
      });
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
