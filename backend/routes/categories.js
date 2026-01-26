const express = require('express');
const router = express.Router();
const CategoryRepo = require('../data/categories');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await CategoryRepo.find({ isActive: true, parent: null });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:slug
// @desc    Get category by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const category = await CategoryRepo.findOne({ slug: req.params.slug, isActive: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get subcategories
    const subcategories = await CategoryRepo.find({ parent: category._id, isActive: true });

    res.json({
      ...category,
      subcategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id/subcategories
// @desc    Get subcategories
// @access  Public
router.get('/:id/subcategories', async (req, res) => {
  try {
    const subcategories = await CategoryRepo.find({
      parent: req.params.id,
      isActive: true
    });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
