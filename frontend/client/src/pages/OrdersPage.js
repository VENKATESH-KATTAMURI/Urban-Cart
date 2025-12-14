import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { getPlaceholderImage } from '../utils/imageUtils';
import './OrdersPage.css';

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="status-icon success" />;
      case 'pending':
        return <FiClock className="status-icon pending" />;
      case 'cancelled':
        return <FiXCircle className="status-icon cancelled" />;
      default:
        return <FiPackage className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const getOrderTotals = (order) => {
    const subtotal =
      order.subtotal ??
      (order.items || []).reduce(
        (sum, item) => sum + (item.priceAtPurchase || 0) * (item.quantity || 0),
        0
      );
    const tax = order.tax ?? Math.round(subtotal * 0.18);
    const shipping = order.shipping ?? 0;
    const grandTotal = order.grandTotal ?? order.totalAmount ?? subtotal + tax + shipping;
    return { subtotal, tax, shipping, grandTotal };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="no-orders">
            <FiPackage className="empty-icon" />
            <h2>No orders yet</h2>
            <p>Start shopping to place your first order</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-number">{order.orderNumber}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items</h4>
                  <div className="items-list">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <img
                            src={item.product?.thumbnailImage || getPlaceholderImage('Product')}
                            alt={item.product?.name || 'Product image'}
                            loading="lazy"
                          />
                        </div>
                        <div className="item-details">
                          <p className="item-name">{item.product?.name}</p>
                          <p className="item-qty">Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          <p>₹{item.priceAtPurchase}</p>
                          <span className="item-total">₹{item.priceAtPurchase * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-address">
                    <p className="address-label">Delivery Address:</p>
                    <p className="address-text">
                      {(order.shippingAddress || order.deliveryAddress || {}).line1 || (order.shippingAddress || order.deliveryAddress || {}).address || '—'}
                      {order.shippingAddress?.city || order.deliveryAddress?.city ? ', ' : ''}
                      {order.shippingAddress?.city || order.deliveryAddress?.city}
                      {order.shippingAddress?.state || order.deliveryAddress?.state ? ', ' : ''}
                      {order.shippingAddress?.state || order.deliveryAddress?.state}
                      {order.shippingAddress?.pincode || order.deliveryAddress?.pincode ? ' - ' : ''}
                      {order.shippingAddress?.pincode || order.deliveryAddress?.pincode}
                    </p>
                  </div>
                  <div className="order-summary">
                    {(() => {
                      const totals = getOrderTotals(order);
                      return (
                        <>
                    <div className="summary-row">
                      <span>Subtotal:</span>
                            <span>₹{totals.subtotal}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax (18%):</span>
                            <span>₹{totals.tax}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                            <span>₹{totals.shipping}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                            <span>₹{totals.grandTotal}</span>
                    </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
