// src/components/layout/MainLayout.jsx - SOLA YENİ ALAN EKLENDI

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';  // ⭐ YENİ
import RightPanel from './RightPanel';
import TopNavbar from './TopNavbar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(430);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const centerContentRef = useRef(null);

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

  // Scroll event listener
  useEffect(() => {
    const centerContent = centerContentRef.current;
    if (!centerContent) return;

    const handleScroll = () => {
      if (centerContent.scrollTop > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    centerContent.addEventListener('scroll', handleScroll);
    return () => centerContent.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="main-layout">
      <TopNavbar />

      <div
        className={`main-layout-content ${isLeftCollapsed ? 'left-collapsed' : ''}`}
        style={!isLeftCollapsed ? {
          gridTemplateColumns: `${leftSidebarWidth}px minmax(0,1fr) ${rightPanelWidth}px`
        } : {
          gridTemplateColumns: `80px minmax(0,1fr) ${rightPanelWidth}px`
        }}
      >
        {/* ⭐ YENİ: Sol Boş Alan */}
        <LeftSidebar
          isCollapsed={isLeftCollapsed}
          onToggleCollapse={setIsLeftCollapsed}
          onWidthChange={setLeftSidebarWidth}
        />

        {/* Orta: MainContent (AYNEN KALDI) */}
        <div className="center-content" ref={centerContentRef}>
          {/* Navigation Tabs */}
          <div className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
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
        <RightPanel onWidthChange={setRightPanelWidth} />
      </div>
    </div>
  );
};

export default MainLayout;