const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const UserRepo = require('../data/users');
const AddressRepo = require('../data/addresses');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await UserRepo.findById(req.user._id);
    const { password, ...userWithoutPassword } = user || {};
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await UserRepo.findById(req.user._id);
    
    if (user) {
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.phone) updates.phone = req.body.phone;
      
      const updatedUser = await UserRepo.updateById(req.user._id, updates);
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/addresses
// @desc    Get user addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
  try {
    const addresses = await AddressRepo.findByUser(req.user._id);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', protect, async (req, res) => {
  try {
    const address = await AddressRepo.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const wishlist = await UserRepo.getWishlist(req.user._id);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/wishlist/:productId
// @desc    Add to wishlist
// @access  Private
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    await UserRepo.addToWishlist(req.user._id, req.params.productId);
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove from wishlist
// @access  Private
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    await UserRepo.removeFromWishlist(req.user._id, req.params.productId);
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
