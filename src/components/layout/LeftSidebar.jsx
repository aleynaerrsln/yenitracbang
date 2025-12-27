// src/components/layout/LeftSidebar.jsx - SPOTIFY LIBRARY GİBİ

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiViewList } from 'react-icons/hi';
import { playlistAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CreatePlaylistModal from '../modals/CreatePlaylistModal';
import './LeftSidebar.css';

const LeftSidebar = ({ isCollapsed, onToggleCollapse }) => {
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
    <div className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button className="library-title" onClick={() => navigate('/library')}>
          <FiMusic size={26} />
          {!isCollapsed && <span>Kitaplığın</span>}
        </button>

        <div className="header-actions">
          {!isCollapsed && (
            <button
              className="create-btn"
              onClick={() => setIsCreateModalOpen(true)}
              title="Oluştur"
            >
              <FiPlus size={20} />
            </button>
          )}

          {/* Collapse Toggle Button */}
          <button
            className="collapse-toggle-btn"
            onClick={() => onToggleCollapse(!isCollapsed)}
            title={isCollapsed ? "Genişlet" : "Daralt"}
          >
            {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!isCollapsed && (
        <div className="sidebar-tabs">
          <button className="tab-item active">Playlists</button>
        </div>
      )}

      {/* Search & Sort */}
      {!isCollapsed && (
        <div className="sidebar-controls">
          <button className="control-btn">
            <FiSearch size={16} />
          </button>
          <button className="control-btn">
            <span className="sort-text">Son çalınanlar</span>
            <HiViewList size={16} />
          </button>
        </div>
      )}

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
  title={isCollapsed ? playlist.name : ''}
>
  <div className="spotify-row">

    <div className="playlist-cover-box">
      {playlist.coverImage ? (
        <img src={playlist.coverImage} alt={playlist.name} />
      ) : (
        <div className="cover-fallback">
          <FiMusic size={24} />
        </div>
      )}
    </div>

    {!isCollapsed && (
      <div className="spotify-text">
        <div className="spotify-title">{playlist.name}</div>
        <div className="spotify-meta">
          Playlist • {playlist.owner?.username || playlist.owner?.name || 'user'}
        </div>
      </div>
    )}

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