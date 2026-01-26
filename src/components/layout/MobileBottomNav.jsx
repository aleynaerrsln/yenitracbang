// src/components/layout/MobileBottomNav.jsx - Mobile Bottom Navigation
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiMusic, FiUser } from 'react-icons/fi';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Ana Sayfa' },
    { path: '/search', icon: FiSearch, label: 'Ara' },
    { path: '/library', icon: FiMusic, label: 'Kitaplık' },
    { path: '/profile', icon: FiUser, label: 'Profil' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <item.icon className="mobile-nav-icon" />
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
