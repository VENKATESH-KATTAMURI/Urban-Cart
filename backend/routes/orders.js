const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const OrderRepo = require('../data/orders');
const CartRepo = require('../data/cart');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      items = [],
      shippingAddress,
      deliveryAddress,
      totalAmount,
      grandTotal,
      subtotal,
      tax,
      shipping,
      paymentMethod,
      paymentStatus,
      transactionId,
      fullName,
      phone
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Normalize items to ensure priceAtPurchase is present
    const orderItems = items
      .map((item) => ({
        product: item.product || item.productId,
        quantity: item.quantity || 1,
        priceAtPurchase:
          item.priceAtPurchase ??
          item.price ??
          (item.product?.price ?? 0)
      }))
      .filter((item) => item.product);

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid order items' });
    }

    // Normalize address from either deliveryAddress or shippingAddress
    const address = shippingAddress || deliveryAddress || {};
    const normalizedAddress = {
      fullName: address.fullName || fullName || '',
      line1: address.address || address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      phone: address.phone || phone || ''
    };

    const computedTotal =
      totalAmount ??
      grandTotal ??
      (typeof subtotal === 'number' && typeof tax === 'number'
        ? subtotal + tax + (shipping || 0)
        : 0);

    // Generate order number (fallback to schema hook if not set)
    const orderNumber = 'ORD' + Date.now();

    const order = await OrderRepo.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: normalizedAddress,
      totalAmount: computedTotal,
      status: paymentStatus === 'completed' ? 'paid' : 'pending',
      paymentStatus: paymentStatus || 'pending',
      paymentId: transactionId || undefined,
      updatedAt: Date.now()
    });

    // Clear cart after order
    await CartRepo.clearCart(req.user._id);

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await OrderRepo.findByUserId(req.user._id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await OrderRepo.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order payment status
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const updatedOrder = await OrderRepo.updatePayment(req.params.id, req.body.paymentId);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
