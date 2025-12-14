import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { getPlaceholderImage, getSemanticImage } from '../utils/imageUtils';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.thumbnailImage || getSemanticImage(product.name) || getPlaceholderImage(product.name));

  const handleAddToCart = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      const result = await addToCart(product._id, 1);
      if (result.success) {
        alert('Added to cart!');
      } else {
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      alert('Error adding to cart');
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation(); // keep the card link from navigating when clicking wishlist

    if (!user) {
      alert('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    const wishlistKey = `wishlist_${user._id}`;
    const savedWishlist = localStorage.getItem(wishlistKey);
    const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : [];

    if (!wishlistIds.includes(product._id)) {
      wishlistIds.push(product._id);
      localStorage.setItem(wishlistKey, JSON.stringify(wishlistIds));
      alert('Added to wishlist!');
    } else {
      alert('Already in wishlist');
    }
  };

  const discountPercentage = Math.round(
    ((product.mrpPrice - product.price) / product.mrpPrice) * 100
  );

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-image">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onError={() => setImageSrc(getPlaceholderImage(product.name))}
        />
        {discountPercentage > 0 && (
          <span className="discount-badge">{discountPercentage}% OFF</span>
        )}
        <button 
          className="wishlist-btn"
          type="button"
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          title="Add to wishlist"
        >
          <FiHeart />
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        {product.brand && (
          <p className="product-brand">{product.brand}</p>
        )}

        <div className="product-rating">
          <FiStar className="star-icon filled" />
          <span>{product.rating?.average?.toFixed(1) || '0.0'}</span>
          <span className="rating-count">
            ({product.rating?.count || 0})
          </span>
        </div>

        <div className="product-price">
          <span className="current-price">₹{product.price}</span>
          {product.mrpPrice > product.price && (
            <span className="original-price">₹{product.mrpPrice}</span>
          )}
        </div>

        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <FiShoppingCart />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
