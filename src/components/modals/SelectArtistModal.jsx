// src/components/modals/SelectArtistModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMoreVertical } from 'react-icons/fi';
import TrackOptionsModal from './TrackOptionsModal';
import './SelectArtistModal.css';

const SelectArtistModal = ({ isOpen, onClose, artists, trackInfo, position }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleArtistClick = (artist) => {
    // Sanatçı sayfasına git
    navigate(`/artist/${artist.slug || artist._id}`);
    onClose();
  };

  return (
    <div className="select-artist-overlay" onClick={onClose}>
      <div
        className="select-artist-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          top: position?.top || 0,
          left: position?.left || 0,
          transform: 'translateX(8px) translateY(8px)'
        }}
      >
        <div className="select-artist-header">
          <h3>Select Artist</h3>
        </div>

        <div className="artists-list">
          {artists.map((artist, index) => (
            <div key={artist._id || index} className="artist-item-wrapper">
              <button
                className="artist-item"
                onClick={() => handleArtistClick(artist)}
              >
                <div className="artist-avatar">
                  {(artist.profileImage || artist.image || artist.imageUrl || artist.avatar) ? (
                    <img src={artist.profileImage || artist.image || artist.imageUrl || artist.avatar} alt={artist.name} />
                  ) : (
                    <div className="artist-avatar-placeholder">
                      {artist.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <span className="artist-name">{artist.name}</span>
                <span className="artist-arrow">›</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectArtistModal;
