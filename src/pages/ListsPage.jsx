// src/pages/ListsPage.jsx - User Playlists Management

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus, FiChevronRight, FiTrash2, FiEdit } from 'react-icons/fi';
import { playlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import CreatePlaylistModal from '../components/modals/CreatePlaylistModal';
import './ListsPage.css';

const ListsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistAPI.getMyPlaylists();

      if (response.data.success) {
        setMyPlaylists(response.data.playlists || []);
      }
    } catch (error) {
      console.error('Fetch playlists error:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (formData) => {
    try {
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      uploadData.append('description', formData.description || '');
      uploadData.append('isPublic', formData.isPublic);

      if (formData.coverImage) {
        uploadData.append('coverImage', formData.coverImage);
      }

      const response = await playlistAPI.createPlaylist(uploadData);

      if (response.data.success) {
        setMyPlaylists(prev => [
          { ...response.data.playlist, musicCount: 0 },
          ...prev,
        ]);

        toast.success('Playlist created successfully');
      }
    } catch (error) {
      console.error('Create playlist error:', error);
      toast.error('Failed to create playlist');
      throw error;
    }
  };

  const handleDeletePlaylist = async (playlistId, e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      const response = await playlistAPI.deletePlaylist(playlistId);

      if (response.data.success) {
        setMyPlaylists(prev => prev.filter(p => p._id !== playlistId));
        toast.success('Playlist deleted successfully');
      }
    } catch (error) {
      console.error('Delete playlist error:', error);
      toast.error('Failed to delete playlist');
    }
  };

  return (
    <div className="lists-page">
      <div className="lists-header">
        <h1>My Lists</h1>
        <button
          className="create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus size={20} />
          <span>Create Playlist</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your playlists...</p>
        </div>
      ) : myPlaylists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiMusic size={64} />
          </div>
          <h2>No playlists yet</h2>
          <p>Create your first playlist to get started</p>
          <button
            className="create-first-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus size={20} />
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="playlists-grid">
          {myPlaylists.map((playlist) => (
            <div
              key={playlist._id}
              className="playlist-card"
              onClick={() => navigate(`/my-playlist/${playlist._id}`)}
            >
              <div className="playlist-cover">
                {playlist.coverImage ? (
                  <img src={playlist.coverImage} alt={playlist.name} />
                ) : (
                  <div className="cover-placeholder">
                    <FiMusic size={32} />
                  </div>
                )}

                <div className="playlist-overlay">
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                    title="Delete Playlist"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="playlist-details">
                <h3>{playlist.name}</h3>
                <p className="track-count">
                  {playlist.musicCount || 0} track{playlist.musicCount !== 1 ? 's' : ''}
                </p>
                {playlist.description && (
                  <p className="playlist-description">{playlist.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePlaylist}
      />
    </div>
  );
};

export default ListsPage;
