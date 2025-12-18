// src/components/layout/LeftSidebar.jsx - SPOTIFY LIBRARY GİBİ

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus, FiSearch } from 'react-icons/fi';
import { HiViewList } from 'react-icons/hi';
import { playlistAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CreatePlaylistModal from '../modals/CreatePlaylistModal';
import './LeftSidebar.css';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredPlaylists = myPlaylists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="left-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <button className="library-title" onClick={() => navigate('/library')}>
          <FiMusic size={24} />
          <span>Kitaplığın</span>
        </button>
        <button 
          className="create-btn" 
          onClick={() => setIsCreateModalOpen(true)}
          title="Oluştur"
        >
          <FiPlus size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button className="tab-item active">Playlists</button>
      </div>

      {/* Search & Sort */}
      <div className="sidebar-controls">
        <button className="control-btn">
          <FiSearch size={16} />
        </button>
        <button className="control-btn">
          <span className="sort-text">Son çalınanlar</span>
          <HiViewList size={16} />
        </button>
      </div>

      {/* Playlists List */}
      <div className="sidebar-playlists">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="playlist-skeleton" />
          ))
        ) : filteredPlaylists.length === 0 ? (
          <div className="empty-playlists">
            <p>No playlists yet</p>
          </div>
        ) : (
          filteredPlaylists.map((playlist) => (
            <button
              key={playlist._id}
              className="sidebar-playlist-item"
              onClick={() => navigate(`/my-playlist/${playlist._id}`)}
            >
              <div className="playlist-cover-box">
                {playlist.coverImage ? (
                  <img src={playlist.coverImage} alt={playlist.name} />
                ) : (
                  <div className="cover-fallback">
                    <FiMusic size={20} />
                  </div>
                )}
              </div>
              <div className="playlist-details">
                <span className="playlist-title">{playlist.name}</span>
                <span className="playlist-meta">
                  Çalma listesi • {playlist.musicCount || 0} şarkı
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePlaylist}
      />
    </div>
  );
};

export default LeftSidebar;