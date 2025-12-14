import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { getPlaceholderImage } from '../utils/imageUtils';
import './WishlistPage.css';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      const wishlistKey = `wishlist_${user._id}`;
      const savedWishlist = localStorage.getItem(wishlistKey);
      if (!savedWishlist) {
        setWishlistItems([]);
        return;
      }

      let wishlistProductIds = [];
      try {
        wishlistProductIds = JSON.parse(savedWishlist) || [];
      } catch (parseErr) {
        console.error('Failed to parse wishlist from localStorage', parseErr);
        localStorage.removeItem(wishlistKey);
        setWishlistItems([]);
        return;
      }

      const uniqueIds = Array.from(new Set(wishlistProductIds)).filter(Boolean);
      if (uniqueIds.length === 0) {
        setWishlistItems([]);
        return;
      }

      const res = await axiosInstance.get('/products', {
        params: { ids: uniqueIds.join(',') }
      });
      setWishlistItems(res.data.products || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    const wishlistKey = `wishlist_${user._id}`;
    const savedWishlist = localStorage.getItem(wishlistKey);
    if (savedWishlist) {
      let wishlistIds = JSON.parse(savedWishlist);
      wishlistIds = wishlistIds.filter(id => id !== productId);
      localStorage.setItem(wishlistKey, JSON.stringify(wishlistIds));
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product._id]: true }));
    try {
      const result = await addToCart(product._id, 1);
      if (result.success) {
        alert('Added to cart!');
        // Optionally remove from wishlist after adding to cart
        handleRemoveFromWishlist(product._id);
      } else {
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      alert('Error adding to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p className="wishlist-subtitle">Your saved items</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <FiHeart className="empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite items to view them later</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="wishlist-count">
              <p>You have {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist</p>
            </div>
            <div className="wishlist-items">
              {wishlistItems.map((product) => (
                <div key={product._id} className="wishlist-item">
                  <div className="item-image-container">
                    <img
                      src={product.thumbnailImage || getPlaceholderImage('Product')}
                      alt={product.name}
                      onClick={() => navigate(`/products/${product.slug}`)}
                      className="item-image"
                      loading="lazy"
                    />
                    <div className="discount-badge">
                      {product.mrpPrice
                        ? Math.round((1 - product.price / product.mrpPrice) * 100)
                        : 0}% OFF
                    </div>
                  </div>

                  <div className="item-details">
                    <h3 className="item-name" onClick={() => navigate(`/products/${product.slug}`)}>
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="item-brand">{product.brand}</p>
                    )}
                    <div className="item-rating">
                      <span className="stars">★★★★★</span>
                      <span className="rating-text">(0 reviews)</span>
                    </div>

                    <div className="item-pricing">
                      <div className="prices">
                        <span className="current-price">₹{product.price}</span>
                        <span className="original-price">₹{product.mrpPrice}</span>
                      </div>
                    </div>

                    <p className="item-description">{product.description?.substring(0, 100)}...</p>
                  </div>

                  <div className="item-actions">
                    <button
                      className="btn btn-primary add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart[product._id]}
                    >
                      <FiShoppingCart />
                      {addingToCart[product._id] ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button
                      className="btn btn-danger remove-btn"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      title="Remove from wishlist"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
