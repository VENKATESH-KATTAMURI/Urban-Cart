import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './CardPaymentPage.css';

const CardPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: false
  });

  const orderData = location.state?.orderData || null;

  if (!orderData) {
    return (
      <div className="card-payment-page">
        <div className="container">
          <div className="payment-error">
            <h2>No order found</h2>
            <p>Please go back to checkout and try again</p>
            <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Format card number (add spaces)
    if (name === 'cardNumber') {
      let formatted = value.replace(/\s/g, '').replace(/[^\d]/g, '');
      if (formatted.length > 16) formatted = formatted.slice(0, 16);
      formatted = formatted.replace(/(\d{4})(?=\d)/g, '$1 ');
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } 
    // Format CVV
    else if (name === 'cvv') {
      let cvvValue = value.replace(/[^\d]/g, '');
      if (cvvValue.length > 4) cvvValue = cvvValue.slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: cvvValue }));
    } 
    // Limit expiry month
    else if (name === 'expiryMonth') {
      let monthValue = value.replace(/[^\d]/g, '');
      if (monthValue.length > 2) monthValue = monthValue.slice(0, 2);
      if (monthValue > 12) monthValue = '12';
      setFormData(prev => ({ ...prev, [name]: monthValue }));
    } 
    // Limit expiry year
    else if (name === 'expiryYear') {
      let yearValue = value.replace(/[^\d]/g, '');
      if (yearValue.length > 2) yearValue = yearValue.slice(0, 2);
      setFormData(prev => ({ ...prev, [name]: yearValue }));
    }
    // Name field - uppercase
    else if (name === 'cardName') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }
    else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const validateForm = () => {
    if (!formData.cardNumber.replace(/\s/g, '')) {
      setError('Please enter card number');
      return false;
    }
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Card number must be 16 digits');
      return false;
    }
    if (!formData.cardName.trim()) {
      setError('Please enter cardholder name');
      return false;
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      setError('Please enter expiry date');
      return false;
    }
    if (!formData.cvv) {
      setError('Please enter CVV');
      return false;
    }
    if (formData.cvv.length < 3) {
      setError('CVV must be at least 3 digits');
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order
      const res = await axiosInstance.post('/orders', {
        ...orderData,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        transactionId: `TXN${Date.now()}`
      });

      if (res.data) {
        setSuccess(true);
        await clearCart();
        
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card-payment-page">
        <div className="container">
          <div className="payment-success">
            <div className="success-icon">
              <FiCheckCircle />
            </div>
            <h2>Payment Successful!</h2>
            <p>Your order has been placed successfully</p>
            <div className="success-details">
              <p><strong>Order Amount:</strong> ₹{orderData.totalAmount}</p>
              <p><strong>Payment Method:</strong> Credit/Debit Card</p>
              <p>Redirecting to orders page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-payment-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/checkout')}>
          <FiArrowLeft /> Back
        </button>

        <div className="payment-grid">
          {/* Order Summary */}
          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <div className="summary-box">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{orderData.subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Tax (18%):</span>
                <span>₹{orderData.tax}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₹{orderData.shipping}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{orderData.totalAmount}</span>
              </div>
            </div>

            <div className="delivery-info">
              <h4>Delivery Address</h4>
              <p className="address-text">
                {orderData.deliveryAddress?.address}<br />
                {orderData.deliveryAddress?.city}, {orderData.deliveryAddress?.state} - {orderData.deliveryAddress?.pincode}
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section">
            <h3>Card Details</h3>
            <form onSubmit={handlePayment} className="payment-form">
              {error && <div className="error-alert">{error}</div>}

              <div className="form-group full-width">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  disabled={loading}
                />
                <small>Enter 16-digit card number</small>
              </div>

              <div className="form-group full-width">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="JOHN DOE"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Month</label>
                  <input
                    type="text"
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleInputChange}
                    placeholder="MM"
                    maxLength="2"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Year</label>
                  <input
                    type="text"
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleInputChange}
                    placeholder="YY"
                    maxLength="2"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="•••"
                    maxLength="4"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  name="saveCard"
                  id="saveCard"
                  checked={formData.saveCard}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <label htmlFor="saveCard">Save this card for future purchases</label>
              </div>

              <div className="security-info">
                <FiLock /> Your payment information is 100% secure
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay ₹${orderData.totalAmount}`}
              </button>

              <div className="payment-methods">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/checkout')}
                  disabled={loading}
                >
                  Cancel Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPaymentPage;
