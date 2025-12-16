// src/components/layout/MainLayout.jsx - SOLA YENİ ALAN EKLENDI

import LeftSidebar from './LeftSidebar';  // ⭐ YENİ
import RightPanel from './RightPanel';
import TopNavbar from './TopNavbar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <TopNavbar />
      
      <div className="main-layout-content">
        {/* ⭐ YENİ: Sol Boş Alan */}
        <LeftSidebar />
        
        {/* Orta: MainContent (AYNEN KALDI) */}
        <div className="center-content">
          {children}
        </div>
        
        {/* Sağ: RightPanel (AYNEN KALDI) */}
        <RightPanel />
      </div>
    </div>
  );
};

export default MainLayout;