import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiEdit2 } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  // const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Set profile data from user context
      setProfileData(user);
      // Fetch addresses if endpoint exists
      try {
        // eslint-disable-next-line no-unused-vars
        const addressRes = await axiosInstance.get('/user/addresses');
        // setAddresses(addressRes.data);
      } catch (err) {
        // Addresses endpoint might not exist yet
        console.log('Addresses not available');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await axiosInstance.put('/user/profile', formData);
      setProfileData({ ...profileData, ...formData });
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-layout">
          {/* Profile Information */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Account Information</h2>
              {!editMode && (
                <button className="btn btn-secondary" onClick={() => {
                  setEditMode(true);
                  setFormData(profileData);
                }}>
                  <FiEdit2 /> Edit Profile
                </button>
              )}
            </div>

            {editMode ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleEditChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email || ''}
                    placeholder="Email cannot be changed"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleEditChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-card">
                  <div className="info-icon">
                    <FiUser />
                  </div>
                  <div className="info-content">
                    <label>Full Name</label>
                    <p>{profileData?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <FiMail />
                  </div>
                  <div className="info-content">
                    <label>Email Address</label>
                    <p>{profileData?.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <FiPhone />
                  </div>
                  <div className="info-content">
                    <label>Phone Number</label>
                    <p>{profileData?.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <FiMapPin />
                  </div>
                  <div className="info-content">
                    <label>Member Since</label>
                    <p>{new Date(profileData?.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="action-card" onClick={() => navigate('/orders')}>
              <h3>📦 My Orders</h3>
              <p>View and track your orders</p>
            </div>

            <div className="action-card" onClick={() => navigate('/wishlist')}>
              <h3>❤️ My Wishlist</h3>
              <p>Your saved items</p>
            </div>

            <div className="action-card" onClick={() => navigate('/cart')}>
              <h3>🛒 Shopping Cart</h3>
              <p>Continue shopping</p>
            </div>

            <div className="action-card logout" onClick={handleLogout}>
              <h3><FiLogOut /> Logout</h3>
              <p>Sign out from your account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
