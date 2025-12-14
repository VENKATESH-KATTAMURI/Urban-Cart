import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { getPlaceholderImage, getSemanticImage } from '../utils/imageUtils';
import ProductCard from '../components/ProductCard';
import './ProductPage.css';


const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageSrc, setImageSrc] = useState('');
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/products/${slug}`);
      setProduct(res.data);
      setImageSrc(res.data.thumbnailImage || getSemanticImage(res.data.name) || getPlaceholderImage(res.data.name));

      // Load recommendations
      const recRes = await axiosInstance.get(`/products/recommended/${res.data._id}`);
      setRecommendations(recRes.data);
    } catch (error) {
      console.error('Failed to load product', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const result = await addToCart(product._id, quantity);
    if (result.success) {
      alert('Added to cart!');
    }
  };

  const handleAddToWishlist = () => {
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

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!product) {
    return <div className="container">Product not found</div>;
  }

  const discountPercentage = Math.round(
    ((product.mrpPrice - product.price) / product.mrpPrice) * 100
  );

  return (
    <div className="product-page">
      <div className="container">
        {/* Product Details */}
        <div className="product-details-section">
          <div className="product-images">
            <img
              src={imageSrc}
              alt={product.name}
              loading="lazy"
              onError={() => setImageSrc(getPlaceholderImage(product.name))}
            />
          </div>

          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            
            {product.brand && (
              <p className="product-brand">Brand: {product.brand}</p>
            )}

            <div className="product-rating">
              <FiStar className="star-icon filled" />
              <span className="rating-value">
                {product.rating?.average?.toFixed(1) || '0.0'}
              </span>
              <span className="rating-count">
                ({product.rating?.count || 0} reviews)
              </span>
            </div>

            <div className="product-price-section">
              <div className="prices">
                <span className="current-price">₹{product.price}</span>
                {product.mrpPrice > product.price && (
                  <>
                    <span className="original-price">₹{product.mrpPrice}</span>
                    <span className="discount-badge">{discountPercentage}% OFF</span>
                  </>
                )}
              </div>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button 
                className="btn btn-primary btn-large"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FiShoppingCart />
                Add to Cart
              </button>

              <button className="btn btn-secondary" onClick={handleAddToWishlist}>
                <FiHeart />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="recommendations-section">
            <h2>You May Also Like</h2>
            <div className="products-grid">
              {recommendations.map((rec) => (
                <ProductCard key={rec._id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
