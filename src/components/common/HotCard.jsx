// src/components/common/HotCard.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiHeart } from 'react-icons/fi';
import './HotCard.css';

const HotCard = ({ playlist, rank, onLike }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(playlist.isLiked || false);

  const handleClick = () => {
    navigate(`/playlist/${playlist._id}`);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    console.log('Playing playlist:', playlist.name);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(playlist._id);
    }
  };

  return (
    <div className="hot-card" onClick={handleClick}>
      <div className="hot-artwork">
        {playlist.coverImage ? (
          <img src={playlist.coverImage} alt={playlist.name} />
        ) : (
          <div className="hot-artwork-placeholder">
            🎵
          </div>
        )}
        <button className="hot-play-overlay" onClick={handlePlay}>
          <FiPlay size={24} />
        </button>
      </div>

      <div className="hot-info">
        <h3 className="hot-title">{playlist.name}</h3>
        <p className="hot-genre">{playlist.genre || 'Various'}</p>
      </div>

      <div className="hot-stats">
        <button
          className={`hot-like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{playlist.trackCount || 0} tracks</span>
        </button>
      </div>
    </div>
  );
};

export default HotCard;
