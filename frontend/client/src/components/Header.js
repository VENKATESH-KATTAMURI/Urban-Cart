import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
    { name: 'Beauty', slug: 'beauty' },
    { name: 'Fitness', slug: 'fitness' },
    { name: 'Stationery', slug: 'stationery' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <Link to="/" className="logo">
              <span className="logo-icon">🛒</span>
              <span className="logo-text">UrbanCart</span>
            </Link>

            {/* Search Bar */}
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <FiSearch />
              </button>
            </form>

            {/* Header Icons */}
            <div className="header-icons">
              {user ? (
                <div className="user-menu">
                  <button className="icon-btn">
                    <FiUser />
                    <span>{user.name}</span>
                  </button>
                  <div className="dropdown">
                    <Link to="/profile">Profile</Link>
                    <Link to="/orders">Orders</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="icon-btn">
                  <FiUser />
                  <span>Login</span>
                </Link>
              )}

              <Link to="/wishlist" className="icon-btn">
                <FiHeart />
                <span>Wishlist</span>
              </Link>

              <Link to="/cart" className="icon-btn cart-btn">
                <FiShoppingCart />
                <span>Cart</span>
                {getCartCount() > 0 && (
                  <span className="cart-badge">{getCartCount()}</span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container">
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link 
                  to={`/category/${category.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
