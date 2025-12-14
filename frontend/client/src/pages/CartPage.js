import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { CartContext } from '../context/CartContext';
import { getPlaceholderImage } from '../utils/imageUtils';
import './CartPage.css';

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(itemId);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <FiShoppingBag className="empty-icon" />
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.product.thumbnailImage || getPlaceholderImage('Product')}
                  alt={item.product.name}
                  loading="lazy"
                />
                
                <div className="item-details">
                  <Link to={`/products/${item.product.slug}`} className="item-name">
                    {item.product.name}
                  </Link>
                  {item.product.brand && (
                    <p className="item-brand">{item.product.brand}</p>
                  )}
                  <p className="item-price">₹{item.product.price}</p>
                </div>

                <div className="item-actions">
                  <div className="quantity-control">
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <p className="item-total">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </p>

                  <button 
                    className="remove-btn"
                    onClick={() => handleRemove(item._id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="free">FREE</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-primary btn-block"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>

            <Link to="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
