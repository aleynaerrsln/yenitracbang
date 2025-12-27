// src/components/layout/MainLayout.jsx - SOLA YENİ ALAN EKLENDI

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';  // ⭐ YENİ
import RightPanel from './RightPanel';
import TopNavbar from './TopNavbar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Discovery', path: '/' },
    { label: 'Top 10', path: '/top10' },
    { label: 'World', path: '/world' },
    { label: 'House', path: '/house' },
    { label: 'Hot', path: '/hot' }
  ];

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  const isTabActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="main-layout">
      <TopNavbar />

      <div className={`main-layout-content ${isLeftCollapsed ? 'left-collapsed' : ''}`}>
        {/* ⭐ YENİ: Sol Boş Alan */}
        <LeftSidebar
          isCollapsed={isLeftCollapsed}
          onToggleCollapse={setIsLeftCollapsed}
        />

        {/* Orta: MainContent (AYNEN KALDI) */}
        <div className="center-content">
          {/* Navigation Tabs */}
          <div className="main-header">
            <div className="header-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`tab-btn ${isTabActive(tab.path) ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {children}
        </div>

        {/* Sağ: RightPanel (AYNEN KALDI) */}
        <RightPanel />
      </div>
    </div>
  );
};

export default MainLayout;