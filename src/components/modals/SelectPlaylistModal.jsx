// src/components/modals/SelectPlaylistModal.jsx

import { useState, useEffect } from 'react';
import { FiMusic, FiMenu } from 'react-icons/fi';
import { playlistAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './SelectPlaylistModal.css';

const SelectPlaylistModal = ({ isOpen, onClose, selectedTracks = [], onAddToPlaylist, currentPlaylistId }) => {
  const toast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('SelectPlaylistModal render - isOpen:', isOpen);
  console.log('SelectPlaylistModal - selectedTracks:', selectedTracks);

  useEffect(() => {
    if (isOpen) {
      console.log('SelectPlaylistModal opened, fetching playlists...');
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      console.log('Fetching playlists...');
      const response = await playlistAPI.getMyPlaylists();
      console.log('Playlists response:', response.data);
      
      if (response.data.success) {
        // Mevcut playlist hariç diğerlerini göster
        const filteredPlaylists = (response.data.playlists || []).filter(
          p => p._id !== currentPlaylistId
        );
        console.log('Filtered playlists:', filteredPlaylists);
        setPlaylists(filteredPlaylists);
      }
    } catch (error) {
      console.error('Fetch playlists error:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = async (playlist) => {
    if (selectedTracks.length === 0) return;

    await onAddToPlaylist(playlist._id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="select-playlist-modal" onClick={onClose}>
      <div className="select-playlist-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="select-playlist-header">
          <h2>Select Playlist</h2>
        </div>

        {/* Playlist List */}
        <div className="select-playlist-list">
          {loading ? (
            <div className="select-empty-state">
              <p>Loading...</p>
            </div>
          ) : playlists.length === 0 ? (
            <div className="select-empty-state">
              <p>No playlists yet</p>
            </div>
          ) : (
            playlists.map((playlist) => {
              return (
                <div
                  key={playlist._id}
                  className="select-playlist-item"
                  onClick={() => handlePlaylistSelect(playlist)}
                >
                  {/* Cover */}
                  <div className="select-playlist-cover">
                    {playlist.coverImage ? (
                      <img src={playlist.coverImage} alt={playlist.name} />
                    ) : (
                      <div className="select-cover-fallback">
                        <FiMusic size={24} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="select-playlist-info">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.musicCount || 0} tracks</p>
                  </div>

                  {/* Menu Icon */}
                  <div className="playlist-menu-icon">
                    <FiMenu size={24} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="select-playlist-footer">
          <button className="select-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlaylistModal;