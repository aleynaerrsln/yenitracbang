// src/pages/Library.jsx - TAM VERSİYON

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus, FiHeart } from 'react-icons/fi';
import { playlistAPI } from '../services/api';
import './Library.css';

const Library = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('playlists'); // 'playlists' | 'liked'
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setPlaylists(response.data.playlists || []);
      }
    } catch (error) {
      console.error('Fetch playlists error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="library-page">
      {/* Header */}
      <div className="library-header">
        <h1>Library</h1>
      </div>

      {/* Tabs */}
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

      {/* Create Playlist Button */}
      {activeTab === 'playlists' && (
        <button className="create-playlist-btn">
          <div className="create-icon">
            <FiPlus size={16} />
          </div>
          <span>Create Playlist</span>
        </button>
      )}

      {/* Content */}
      <div className="library-content">
        {loading ? (
          <div className="library-loading">
            <div className="spinner"></div>
          </div>
        ) : activeTab === 'playlists' ? (
          playlists.length === 0 ? (
            <div className="library-empty">
              <FiMusic size={64} />
              <p>No playlists yet</p>
            </div>
          ) : (
            <div className="playlists-grid">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="library-playlist-item"
                  onClick={() => navigate(`/playlist/${playlist._id}`)}
                >
                  <div className="library-playlist-cover">
                    {playlist.coverImage ? (
                      <img src={playlist.coverImage} alt={playlist.name} />
                    ) : (
                      <FiMusic size={32} />
                    )}
                  </div>
                  <div className="library-playlist-info">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.musicCount || 0} tracks</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="library-empty">
            <FiHeart size={64} />
            <p>No liked songs yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;