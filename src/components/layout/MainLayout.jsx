// src/components/layout/MainLayout.jsx - TOPNAVBAR EKLE

import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import TopNavbar from './TopNavbar';  // ⭐ EKLE
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <TopNavbar />  {/* ⭐ EKLE */}
      <div className="main-layout-content">
        <Sidebar />
        <div className="center-content">
          {children}
        </div>
        <RightPanel />
      </div>
    </div>
  );
};

export default MainLayout;