const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CartRepo = require('../data/cart');

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await CartRepo.findWithPopulatedItems(req.user._id);
    
    if (!cart) {
      cart = await CartRepo.createForUser(req.user._id);
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const cart = await CartRepo.addItem(req.user._id, productId, quantity);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', protect, async (req, res) => {
  const { quantity } = req.body;

  try {
    const cart = await CartRepo.updateItem(req.user._id, req.params.itemId, quantity);
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart or item not found' });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await CartRepo.removeItem(req.user._id, req.params.itemId);
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await CartRepo.clearCart(req.user._id);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;