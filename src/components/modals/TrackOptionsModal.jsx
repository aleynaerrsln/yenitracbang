// src/components/modals/TrackOptionsModal.jsx
import React from 'react';
import { FiUser, FiList, FiShare2 } from 'react-icons/fi';
import './TrackOptionsModal.css';

const TrackOptionsModal = ({ isOpen, onClose, onViewArtists, onAddToPlaylist, onShare, position }) => {
  if (!isOpen) return null;

  const handleOptionClick = (action) => {
    action();
    onClose();
  };

  return (
    <div className="track-options-overlay" onClick={onClose}>
      <div
        className="track-options-dropdown"
        onClick={(e) => e.stopPropagation()}
        style={{
          top: position?.top || 0,
          left: position?.left || 0
        }}
      >
        <div className="track-options-list">
          <button
            className="track-option-item"
            onClick={() => handleOptionClick(onViewArtists)}
          >
            <FiUser size={18} />
            <span>View Artists</span>
            <span className="option-arrow">›</span>
          </button>

          <button
            className="track-option-item"
            onClick={() => handleOptionClick(onAddToPlaylist)}
          >
            <FiList size={18} />
            <span>Add to Playlist</span>
          </button>

          <button
            className="track-option-item"
            onClick={() => handleOptionClick(onShare)}
          >
            <FiShare2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOptionsModal;
