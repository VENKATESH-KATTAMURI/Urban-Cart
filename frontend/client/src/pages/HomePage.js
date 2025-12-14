import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featuredRes, trendingRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/products/featured/list'),
        axiosInstance.get('/products/trending/list'),
        axiosInstance.get('/categories')
      ]);

      setFeaturedProducts(featuredRes.data);
      setTrendingProducts(trendingRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = [
    {
      name: 'Electronics & Accessories',
      slug: 'electronics',
      icon: '📱',
      color: '#3B82F6'
    },
    {
      name: 'Fashion & Lifestyle',
      slug: 'fashion',
      icon: '👕',
      color: '#EC4899'
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      icon: '🏠',
      color: '#10B981'
    },
    {
      name: 'Beauty & Personal Care',
      slug: 'beauty',
      icon: '💄',
      color: '#F59E0B'
    },
    {
      name: 'Fitness & Essentials',
      slug: 'fitness',
      icon: '💪',
      color: '#8B5CF6'
    },
    {
      name: 'Stationery & Office',
      slug: 'stationery',
      icon: '✏️',
      color: '#6366F1'
    }
  ];

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">Smart Shopping for Urban Living</h1>
          <p className="hero-subtitle">
            Discover deals on electronics, fashion, and home essentials
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              Shop Now
            </Link>
            <Link to="/products?sort=popular" className="btn btn-secondary">
              View Popular Picks
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categoryData.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <h3>{category.name}</h3>
                <span className="category-link">Shop Now →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="view-all">View All →</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Highlight Section */}
      <section className="section highlight-section">
        <div className="container">
          <div className="highlight-banner">
            <div className="highlight-content">
              <span className="highlight-badge">✨ Curated Collections</span>
              <h2>Fresh drops curated for you</h2>
              <p>Handpicked picks across electronics, fashion, and home that ship fast.</p>
              <Link to="/products?sort=newest" className="btn btn-accent">
                Explore New Arrivals
              </Link>
            </div>
            <div className="highlight-grid">
              {categoryData.slice(0, 3).map((category) => (
                <Link key={category.slug} to={`/category/${category.slug}`} className="highlight-tile">
                  <span className="tile-icon" aria-hidden>
                    {category.icon}
                  </span>
                  <div>
                    <p className="tile-label">{category.name}</p>
                    <span className="tile-link">Shop now →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trending Now</h2>
            <Link to="/products?sort=popular" className="view-all">View All →</Link>
          </div>
          <div className="products-grid">
            {trendingProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-box">
              <span className="feature-icon">🚚</span>
              <h3>Free Delivery</h3>
              <p>On orders above ₹500</p>
            </div>
            <div className="feature-box">
              <span className="feature-icon">🔄</span>
              <h3>Easy Returns</h3>
              <p>7-day return policy</p>
            </div>
            <div className="feature-box">
              <span className="feature-icon">🔒</span>
              <h3>Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
            <div className="feature-box">
              <span className="feature-icon">💬</span>
              <h3>24/7 Support</h3>
              <p>Dedicated customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated with Urban Deals</h2>
            <p>Subscribe to get special offers and updates</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                required
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
