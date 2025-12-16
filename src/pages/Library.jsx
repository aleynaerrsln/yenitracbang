// src/pages/Library.jsx - TOAST İLE GÜNCELLE

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus, FiChevronRight } from 'react-icons/fi';
import { playlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import CreatePlaylistModal from '../components/modals/CreatePlaylistModal';
import './Library.css';

const Library = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('playlists');
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'playlists') {
      fetchPlaylists();
    }
  }, [activeTab]);

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
      const playlistData = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
      };

      const response = await playlistAPI.createPlaylist(playlistData);
      
      if (response.data.success) {
        setMyPlaylists([response.data.playlist, ...myPlaylists]);
        toast.success('Playlist created successfully');
      }
    } catch (error) {
      console.error('Create playlist error:', error);
      toast.error('Failed to create playlist');
      throw error;
    }
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>Library</h1>
      </div>

      <div className="library-tabs">
        <button
          className={`tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists
        </button>
        <button
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          Liked Songs
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'playlists' ? (
          <>
            <button 
              className="create-playlist-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="create-icon">
                <FiPlus size={20} />
              </div>
              <span>Create Playlist</span>
            </button>

            {loading ? (
              <div className="loading-state">
                <p>Loading...</p>
              </div>
            ) : myPlaylists.length === 0 ? (
              <div className="empty-state">
                <p>No playlists yet</p>
              </div>
            ) : (
              <div className="playlists-list">
                {myPlaylists.map((playlist) => (
                  <button
                    key={playlist._id}
                    className="playlist-item"
                    onClick={() => navigate(`/my-playlist/${playlist._id}`)}
                  >
                    <div className="playlist-cover-small">
                      {playlist.coverImage ? (
                        <img src={playlist.coverImage} alt={playlist.name} />
                      ) : (
                        <FiMusic size={20} />
                      )}
                    </div>
                    <div className="playlist-info">
                      <h3>{playlist.name}</h3>
                      <p>{playlist.musicCount || 0} tracks</p>
                    </div>
                    <FiChevronRight size={20} className="chevron-icon" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No liked songs yet</p>
          </div>
        )}
      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePlaylist}
      />
    </div>
  );
};

export default Library;