// src/components/modals/RenamePlaylistModal.jsx

import { useState, useEffect } from 'react';
import './RenamePlaylistModal.css';

const RenamePlaylistModal = ({ isOpen, onClose, currentName, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen && currentName) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() && name.trim() !== currentName) {
      onSave(name.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="rename-modal-overlay" onClick={onClose}>
      <div className="rename-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rename-modal-header">
          <h2>Change Name</h2>
        </div>

        <input
          type="text"
          className="rename-modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Playlist name"
          maxLength={50}
          autoFocus
        />

        <div className="rename-modal-buttons">
          <button className="rename-modal-btn rename-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rename-modal-btn rename-save-btn"
            onClick={handleSave}
            disabled={!name.trim() || name.trim() === currentName}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenamePlaylistModal;