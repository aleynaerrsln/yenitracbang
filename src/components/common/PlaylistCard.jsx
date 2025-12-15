// src/components/common/PlaylistCard.jsx - TAMAMINI DEĞIŞTIR

import { useNavigate } from 'react-router-dom';
import { FiPlay, FiHeart, FiMoreHorizontal } from 'react-icons/fi';
import './PlaylistCard.css';

const PlaylistCard = ({ playlist, onClick }) => {
  const navigate = useNavigate();
  const trackCount = playlist.musicCount || playlist.musics?.length || 0;

  const handleClick = () => {
    console.log('Playlist clicked:', playlist._id); // DEBUG
    navigate(`/playlist/${playlist._id}`);
  };

  return (
    <div className="playlist-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="playlist-cover-wrapper">
        <div className="playlist-cover">
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.name} />
          ) : (
            <div className="playlist-cover-placeholder">
              <span>🎵</span>
            </div>
          )}
        </div>
        
        <div className="playlist-overlay">
          <button className="play-btn" onClick={(e) => e.stopPropagation()}>
            <FiPlay />
          </button>
        </div>
      </div>

      <div className="playlist-info">
        <h3 className="playlist-title">{playlist.name}</h3>
        
        <div className="playlist-meta">
          <span className="playlist-genre">
            {playlist.genreDisplayName || playlist.genre}
          </span>
          <span className="playlist-dot">•</span>
          <span className="playlist-count">{trackCount} tracks</span>
        </div>

        <div className="playlist-stats">
          <div className="stat-item">
            <FiHeart size={14} />
            <span>{playlist.likes || 0}</span>
          </div>
          <div className="stat-item">
            <span>👁️</span>
            <span>{playlist.views || 0}</span>
          </div>
        </div>
      </div>

      <button className="playlist-more" onClick={(e) => {
        e.stopPropagation();
        console.log('More options');
      }}>
        <FiMoreHorizontal />
      </button>
    </div>
  );
};

export default PlaylistCard;