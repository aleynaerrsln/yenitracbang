// src/components/layout/LeftSidebar.jsx

import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus } from 'react-icons/fi';
import './LeftSidebar.css';

const LeftSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="left-sidebar">

      {/* Library */}
      <button className="library-btn" onClick={() => navigate('/library')}>
        <FiMusic size={22} />
        <span>Library</span>
      </button>

      {/* Playlists Header */}
      <div className="playlists-header">
        <span>PLAYLISTS</span>
        <button className="btn-add" title="Create Playlist">
          <FiPlus size={18} />
        </button>
      </div>

      {/* Empty State */}
      <div className="playlists-list">
        <p className="no-playlists">No playlists yet</p>
      </div>

    </div>
  );
};

export default LeftSidebar;
