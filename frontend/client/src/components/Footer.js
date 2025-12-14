import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h3>About UrbanCart</h3>
            <p>
              Smart Shopping for Urban Living. Your one-stop destination for 
              electronics, fashion, home essentials, and more.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-section">
            <h3>Policies</h3>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/cancellation">Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="footer-features">
          <div className="feature-item">
            <span className="feature-icon">🚚</span>
            <div>
              <h4>Free Delivery</h4>
              <p>On orders above ₹500</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <div>
              <h4>Easy Returns</h4>
              <p>7-day return policy</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <div>
              <h4>Secure Payment</h4>
              <p>100% secure transactions</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <div>
              <h4>24/7 Support</h4>
              <p>Dedicated customer service</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; 2025 UrbanCart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
