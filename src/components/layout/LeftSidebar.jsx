// src/components/layout/LeftSidebar.jsx - SPOTIFY LIBRARY GİBİ

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { playlistAPI, searchAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CreatePlaylistModal from '../modals/CreatePlaylistModal';
import './LeftSidebar.css';

const LeftSidebar = ({ isCollapsed, onToggleCollapse, onWidthChange }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(430);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX - 8;
      if (newWidth >= 300 && newWidth <= 750) {
        setSidebarWidth(newWidth);
        if (onWidthChange) {
          onWidthChange(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = () => {
    setIsResizing(true);
  };

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

  const handleSearchToggle = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      // Clear search when closing
      setSearchQuery('');
      setSearchResults([]);
    } else {
      // Focus input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchAPI.searchPlaylists(query.trim());

      if (response.data.success) {
        setSearchResults(response.data.playlists || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  // Show search results when searching, otherwise show user's playlists
  const displayedPlaylists = isSearching && searchQuery.trim().length >= 2
    ? searchResults
    : myPlaylists;

  return (
    <div
      ref={sidebarRef}
      className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={!isCollapsed ? { width: `${sidebarWidth}px` } : {}}
    >
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
          <button className="tab-item" onClick={handleSearchToggle}>
            <FiSearch size={14} />
          </button>
        </div>
      )}

      {/* Search Input */}
      {!isCollapsed && isSearching && (
        <div className="search-input-wrapper">
          <FiSearch size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Playlist ara..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button
            className="close-search-btn"
            onClick={searchQuery ? handleClearSearch : handleSearchToggle}
            title={searchQuery ? "Temizle" : "Kapat"}
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Playlists List */}
      <div className="sidebar-playlists">
        {loading || searchLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="playlist-skeleton" />
          ))
        ) : displayedPlaylists.length === 0 ? (
          <div className="empty-playlists">
            <p>{isSearching ? 'Playlist bulunamadı' : 'No playlists yet'}</p>
          </div>
        ) : (
          displayedPlaylists.map((playlist) => (
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

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="resize-handle"
          onMouseDown={handleResizeStart}
        />
      )}

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