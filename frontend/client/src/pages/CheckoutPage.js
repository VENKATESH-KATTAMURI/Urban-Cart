import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { getPlaceholderImage } from '../utils/imageUtils';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (!cart || cart.items?.length === 0) {
      navigate('/cart');
    }
  }, [user, cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare order data
      const total = calculateTotal();
      const tax = Math.round(total * 0.18);
      const shipping = total > 500 ? 0 : 99;
      const grandTotal = total + tax + shipping;

      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          priceAtPurchase: item.product.price
        })),
        deliveryAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        subtotal: total,
        tax: tax,
        shipping: shipping,
        totalAmount: grandTotal,
        grandTotal: grandTotal
      };

      // Route to appropriate payment page based on selected method
      if (formData.paymentMethod === 'card') {
        navigate('/payment/card', { state: { orderData } });
      } else if (formData.paymentMethod === 'upi') {
        navigate('/payment/upi', { state: { orderData } });
      } else if (formData.paymentMethod === 'cod') {
        // For COD, create order directly
        const res = await axiosInstance.post('/orders', {
          ...orderData,
          paymentMethod: 'cod',
          paymentStatus: 'pending'
        });
        
        if (res.data) {
          alert('Order placed successfully! You can pay on delivery.');
          await clearCart();
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items?.length === 0) {
    return <div className="container" style={{ padding: '2rem 0' }}>Loading...</div>;
  }

  const total = calculateTotal();
  const tax = Math.round(total * 0.18);
  const shipping = total > 500 ? 0 : 99;
  const grandTotal = total + tax + shipping;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-container">
          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {cart.items.map(item => (
                <div key={item._id} className="order-item">
                  <img
                    src={item.product.thumbnailImage || getPlaceholderImage('Product')}
                    alt={item.product.name}
                    className="item-image"
                    loading="lazy"
                  />
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p className="item-brand">{item.product.brand}</p>
                    <p className="item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-row">
                <span>Tax (18%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="price-row total">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handlePlaceOrder} className="checkout-form">
            <h2>Delivery Address</h2>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address"
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  required
                />
              </div>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Payment Method</h2>

            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleChange}
                />
                <span>UPI</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg place-order-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Place Order - ₹${grandTotal.toLocaleString('en-IN')}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
