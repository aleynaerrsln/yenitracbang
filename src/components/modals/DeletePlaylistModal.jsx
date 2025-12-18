// src/components/modals/DeletePlaylistModal.jsx

import './DeletePlaylistModal.css';

const DeletePlaylistModal = ({ isOpen, onClose, playlistName, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon">🗑️</div>
        
        <div className="delete-modal-header">
          <h2>Delete Playlist</h2>
          <p>
            Are you sure you want to delete{' '}
            <span className="delete-playlist-name">{playlistName}</span>?
            <br />
            This action cannot be undone.
          </p>
        </div>

        <div className="delete-modal-buttons">
          <button 
            className="delete-modal-btn delete-cancel-btn" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="delete-modal-btn delete-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePlaylistModal;