// src/components/layout/TopNavbar.jsx - HAMBURGER MENU

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiBell, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import SideMenu from './SideMenu';
import './TopNavbar.css';

const TopNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="top-navbar">
      {/* Hamburger Menu + Logo */}
      <div className="navbar-left">
        <button className="hamburger-btn" onClick={() => setIsSideMenuOpen(true)}>
          <FiMenu size={24} />
        </button>
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="TrackBang" />
        </div>
      </div>

      {/* Center: Home + Search */}
      <div className="navbar-center">
        <button className="nav-home-btn" onClick={() => navigate('/')}>
          <FiHome size={24} />
        </button>

        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Ne çalmak istiyorsun?"
            onClick={() => navigate('/search')}
            readOnly
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="navbar-actions">
        <button className="navbar-btn">
          <FiBell size={20} />
        </button>

        {/* User Profile Dropdown */}
        <div className="navbar-profile-wrapper">
          <div 
            className="navbar-profile" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.username} />
            ) : (
              <div className="profile-placeholder">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-menu-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.username} />
                  ) : (
                    <FiUser size={24} />
                  )}
                </div>
                <div className="user-menu-info">
                  <span className="user-menu-name">{user?.username || 'User'}</span>
                  <span className="user-menu-badge">
                    {user?.badge === 'trackbang' ? '👑 TrackBang Pro' :
                     user?.badge === 'premium' ? '⭐ Premium' :
                     user?.subscriptionStatus === 'trial_active' ? '🆓 Free Trial' : 'Free'}
                  </span>
                </div>
              </div>

              <div className="user-menu-divider" />

              <button className="user-menu-item" onClick={() => navigate('/profile')}>
                <FiUser size={18} />
                <span>Profile</span>
              </button>

              <div className="user-menu-divider" />

              <button className="user-menu-item logout" onClick={handleLogout}>
                <FiLogOut size={18} />
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Side Menu Drawer */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
    </div>
  );
};

export default TopNavbar;