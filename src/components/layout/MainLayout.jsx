// src/components/layout/MainLayout.jsx - MESAJLAŞMA PANELİ EKLENDİ

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import TopNavbar from './TopNavbar';
import Footer from './Footer';
import MessagesPanel from '../chat/MessagesPanel';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(430);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMessagesPanelOpen, setIsMessagesPanelOpen] = useState(false);
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

  const handleOpenMessages = () => {
    setIsMessagesPanelOpen(true);
  };

  const handleCloseMessages = () => {
    setIsMessagesPanelOpen(false);
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
      <TopNavbar onOpenChat={handleOpenMessages} />

      <div
        className={`main-layout-content ${isLeftCollapsed ? 'left-collapsed' : ''}`}
        style={!isLeftCollapsed ? {
          gridTemplateColumns: `${leftSidebarWidth}px minmax(0,1fr) ${rightPanelWidth}px`
        } : {
          gridTemplateColumns: `80px minmax(0,1fr) ${rightPanelWidth}px`
        }}
      >
        {/* Sol Sidebar */}
        <LeftSidebar
          isCollapsed={isLeftCollapsed}
          onToggleCollapse={setIsLeftCollapsed}
          onWidthChange={setLeftSidebarWidth}
        />

        {/* Orta: MainContent */}
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

          {/* Footer */}
          <Footer />
        </div>

        {/* Sağ: RightPanel */}
        <RightPanel onWidthChange={setRightPanelWidth} />
      </div>

      {/* Mesajlaşma Paneli - Instagram/WhatsApp tarzı sağ panel */}
      <MessagesPanel
        isOpen={isMessagesPanelOpen}
        onClose={handleCloseMessages}
      />
    </div>
  );
};

export default MainLayout;
