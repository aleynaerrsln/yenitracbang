// src/components/layout/SideMenu.jsx

import { useNavigate } from 'react-router-dom';
import { 
  FiList, FiMusic, FiShoppingBag, FiStar, 
  FiBell, FiSettings, FiCreditCard, 
  FiInfo, FiHelpCircle, FiLogOut, FiX 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="side-menu-overlay" onClick={onClose} />}

      {/* Drawer */}
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="side-menu-header">
          <img src="/logo.png" alt="TrackBang" className="side-menu-logo" />
          <button className="premium-badge">
            <span className="star-icon">⭐</span>
            Premium
          </button>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Menu Section */}
        <div className="side-menu-section">
          <div className="section-title">MENU</div>
          
          <button className="menu-item" onClick={() => handleNavigate('/lists')}>
            <FiList size={20} />
            <span>Lists</span>
            <span className="arrow">›</span>
          </button>

          <button className="menu-item" onClick={() => handleNavigate('/sample-bank')}>
            <FiMusic size={20} />
            <span>Sample Bank</span>
            <span className="arrow">›</span>
          </button>

          <button className="menu-item" onClick={() => handleNavigate('/store')}>
            <FiShoppingBag size={20} />
            <span>Store</span>
            <span className="arrow">›</span>
          </button>

          <button className="menu-item" onClick={() => handleNavigate('/artist-essential')}>
            <FiStar size={20} />
            <span>Artist Essential</span>
            <span className="arrow">›</span>
          </button>
        </div>

        {/* App Section */}
        <div className="side-menu-section">
          <div className="section-title">APP</div>
          
          <button className="menu-item" onClick={() => handleNavigate('/notifications')}>
            <FiBell size={20} />
            <span>Notifications</span>
            <span className="arrow">›</span>
          </button>

          <button className="menu-item" onClick={() => handleNavigate('/settings')}>
            <FiSettings size={20} />
            <span>Settings</span>
            <span className="arrow">›</span>
          </button>

          <button className="menu-item" onClick={() => handleNavigate('/subscription')}>
            <FiCreditCard size={20} />
            <span>Subscription</span>
            <span className="badge-new">NEW</span>
            <span className="arrow">›</span>
          </button>
        </div>

        {/* Support Section */}
        <div className="side-menu-section">
          <div className="section-title">SUPPORT</div>
          
          <button className="menu-item" onClick={() => handleNavigate('/about')}>
            <FiInfo size={20} />
            <span>About Us</span>
            <span className="arrow">›</span>
          </button>

          <button className="menu-item" onClick={() => handleNavigate('/help')}>
            <FiHelpCircle size={20} />
            <span>Help & Support</span>
            <span className="arrow">›</span>
          </button>
        </div>

        {/* Exit Button */}
        <div className="side-menu-footer">
          <button className="exit-btn" onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Exit</span>
          </button>
          <div className="version">version 1.0.0</div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;