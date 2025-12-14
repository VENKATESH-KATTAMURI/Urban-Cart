import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { CartContext } from '../context/CartContext';
import { FiArrowLeft, FiCheckCircle, FiSmartphone, FiCopy } from 'react-icons/fi';
import './UPIPaymentPage.css';

const UPIPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [upiMethod, setUpiMethod] = useState(''); // 'id', 'vpa', 'scan'
  const [copied, setCopied] = useState(false);

  const orderData = location.state?.orderData || null;

  if (!orderData) {
    return (
      <div className="upi-payment-page">
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

  const generateUPIString = () => {
    const upiParams = [
      `pa=${process.env.REACT_APP_UPI_ID || 'urbancart@upi'}`,
      `pn=Urban%20Cart`,
      `am=${orderData.totalAmount}`,
      `tn=Order%20Payment`,
      `tr=${Date.now()}`
    ];
    return `upi://?${upiParams.join('&')}`;
  };

  const handleCopyUPI = () => {
    const upiAddr = process.env.REACT_APP_UPI_ID || 'urbancart@upi';
    navigator.clipboard.writeText(upiAddr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateUpiId = (id) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(id);
  };

  const handleUpiIdSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!upiId.trim()) {
      setError('Please enter your UPI ID');
      return;
    }

    if (!validateUpiId(upiId)) {
      setError('Invalid UPI ID format (e.g., name@upi)');
      return;
    }

    setLoading(true);
    try {
      // Simulate UPI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order
      const res = await axiosInstance.post('/orders', {
        ...orderData,
        paymentMethod: 'upi',
        paymentDetails: { upiId },
        paymentStatus: 'completed',
        transactionId: `UPI${Date.now()}`
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

  const handleOpenUPIApp = () => {
    window.open(generateUPIString(), '_blank');
  };

  if (success) {
    return (
      <div className="upi-payment-page">
        <div className="container">
          <div className="payment-success">
            <div className="success-icon">
              <FiCheckCircle />
            </div>
            <h2>Payment Successful!</h2>
            <p>Your order has been placed successfully</p>
            <div className="success-details">
              <p><strong>Order Amount:</strong> ₹{orderData.totalAmount}</p>
              <p><strong>Payment Method:</strong> UPI</p>
              <p>Redirecting to orders page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upi-payment-page">
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

            <div className="upi-providers">
              <h4>Supported UPI Apps</h4>
              <div className="providers-grid">
                <div className="provider-icon">
                  <img src="https://img.icons8.com/color/96/000000/google-pay.png" alt="Google Pay" title="Google Pay" />
                </div>
                <div className="provider-icon">
                  <img src="https://img.icons8.com/color/96/000000/phonepay.png" alt="PhonePe" title="PhonePe" />
                </div>
                <div className="provider-icon">
                  <img src="https://img.icons8.com/color/96/000000/paytm.png" alt="Paytm" title="Paytm" />
                </div>
                <div className="provider-icon">
                  <img src="https://img.icons8.com/color/96/000000/amazon.png" alt="Amazon Pay" title="Amazon Pay" />
                </div>
              </div>
            </div>
          </div>

          {/* UPI Payment Form */}
          <div className="payment-form-section">
            <h3>UPI Payment</h3>

            {/* Payment Methods */}
            <div className="payment-methods-tabs">
              <button
                className={`tab-btn ${upiMethod === 'id' ? 'active' : ''}`}
                onClick={() => setUpiMethod('id')}
                disabled={loading}
              >
                UPI ID
              </button>
              <button
                className={`tab-btn ${upiMethod === 'vpa' ? 'active' : ''}`}
                onClick={() => setUpiMethod('vpa')}
                disabled={loading}
              >
                MERCHANT ID
              </button>
              <button
                className={`tab-btn ${upiMethod === 'scan' ? 'active' : ''}`}
                onClick={() => setUpiMethod('scan')}
                disabled={loading}
              >
                SCAN & PAY
              </button>
            </div>

            {/* UPI ID Input */}
            {upiMethod === 'id' && (
              <form onSubmit={handleUpiIdSubmit} className="payment-form">
                {error && <div className="error-alert">{error}</div>}

                <div className="form-group">
                  <label>Enter Your UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@upi"
                    disabled={loading}
                    autoFocus
                  />
                  <small>Example: john@paytm or jane@googleplay</small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Pay ₹${orderData.totalAmount}`}
                </button>
              </form>
            )}

            {/* Merchant UPI ID */}
            {upiMethod === 'vpa' && (
              <div className="merchant-section">
                {error && <div className="error-alert">{error}</div>}

                <div className="merchant-id-box">
                  <p className="merchant-label">Urban Cart Merchant UPI ID:</p>
                  <div className="merchant-id-display">
                    <span className="id-text">{process.env.REACT_APP_UPI_ID || 'urbancart@upi'}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={handleCopyUPI}
                    >
                      <FiCopy /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="merchant-instructions">
                  <h4>How to Pay:</h4>
                  <ol>
                    <li>Copy the UPI ID above</li>
                    <li>Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                    <li>Paste the UPI ID in the payment field</li>
                    <li>Enter amount: ₹{orderData.totalAmount}</li>
                    <li>Complete the payment</li>
                  </ol>
                </div>

                <div className="payment-amount">
                  <p>Amount to Pay:</p>
                  <p className="amount-text">₹{orderData.totalAmount}</p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={handleOpenUPIApp}
                  disabled={loading}
                >
                  <FiSmartphone /> Open UPI App
                </button>
              </div>
            )}

            {/* Scan & Pay QR Code */}
            {upiMethod === 'scan' && (
              <div className="scan-section">
                <div className="qr-code-box">
                  <p className="scan-label">Scan to Pay</p>
                  <div className="qr-placeholder">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="100" fill="white" stroke="#e5e7eb" strokeWidth="2" />
                      {/* Simple pattern for QR representation */}
                      <rect x="10" y="10" width="30" height="30" fill="#1f2937" />
                      <rect x="60" y="10" width="30" height="30" fill="#1f2937" />
                      <rect x="10" y="60" width="30" height="30" fill="#1f2937" />
                      <circle cx="50" cy="50" r="15" fill="none" stroke="#667eea" strokeWidth="2" />
                    </svg>
                  </div>
                  <p className="qr-amount">₹{orderData.totalAmount}</p>
                </div>

                <div className="scan-info">
                  <p>Using your UPI app:</p>
                  <ol>
                    <li>Open Google Pay, PhonePe, or Paytm</li>
                    <li>Select "Send Money" or "Pay"</li>
                    <li>Tap camera icon</li>
                    <li>Scan the QR code</li>
                  </ol>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-large"
                  onClick={() => setUpiMethod('id')}
                  disabled={loading}
                >
                  Use UPI ID Instead
                </button>
              </div>
            )}

            <div className="security-note">
              ✓ All transactions are secured with 256-bit encryption
            </div>

            <button
              className="btn btn-outline"
              onClick={() => navigate('/checkout')}
              disabled={loading}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentPage;
