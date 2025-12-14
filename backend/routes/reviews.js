const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ReviewRepo = require('../data/reviews');

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await ReviewRepo.findByProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, async (req, res) => {
  const { productId, rating, comment } = req.body;

  try {
    // Check if review already exists
    const existingReview = await ReviewRepo.findOneByProductAndUser(productId, req.user._id);

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create review
    const review = await ReviewRepo.create({
      product: productId,
      user: req.user._id,
      rating,
      comment
    });

    // Update product rating
    await ReviewRepo.updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
