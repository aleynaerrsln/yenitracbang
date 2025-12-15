// src/components/layout/Sidebar.jsx - HOME KALDIRILDI, SADECE LIBRARY

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { playlistAPI } from '../../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyPlaylists();
    }
  }, [user]);

  const fetchMyPlaylists = async () => {
    try {
      const response = await playlistAPI.getMyPlaylists();
      if (response.data.success) {
        setMyPlaylists(response.data.playlists || []);
      }
    } catch (error) {
      console.error('Playlists fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar">
      {/* Library Button - Home kaldırıldı */}
      <button className="library-btn" onClick={() => navigate('/library')}>
        <FiMusic size={24} />
        <span>Library</span>
      </button>

      {/* Playlists Section */}
      <div className="sidebar-playlists">
        <div className="playlists-header">
          <h3>PLAYLISTS</h3>
          <button className="btn-add">
            <FiPlus size={20} />
          </button>
        </div>

        <div className="playlists-list">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="playlist-item-skeleton" />
            ))
          ) : myPlaylists.length === 0 ? (
            <p className="no-playlists">No playlists yet</p>
          ) : (
            myPlaylists.map((playlist) => (
              <button 
                key={playlist._id} 
                className="playlist-item"
                onClick={() => navigate(`/playlist/${playlist._id}`)}
              >
                <div className="playlist-cover">
                  {playlist.coverImage ? (
                    <img src={playlist.coverImage} alt={playlist.name} />
                  ) : (
                    <FiMusic />
                  )}
                </div>
                <div className="playlist-info">
                  <span className="playlist-name">{playlist.name}</span>
                  <span className="playlist-count">
                    {playlist.musicCount || 0} tracks
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;