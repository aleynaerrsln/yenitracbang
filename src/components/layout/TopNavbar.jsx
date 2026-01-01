// src/components/layout/TopNavbar.jsx - HAMBURGER MENU + SEARCH DROPDOWN

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiBell, FiUser, FiLogOut, FiMenu, FiSearch, FiX, FiMusic, FiDisc, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { searchAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SideMenu from './SideMenu';
import './TopNavbar.css';

const TopNavbar = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ musics: [], playlists: [], artists: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState('all');
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounce = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults({ musics: [], playlists: [], artists: [] });
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setSearchLoading(true);
      const response = await searchAPI.searchAll(query);

      if (response.data.success) {
        setSearchResults(response.data.results || { musics: [], playlists: [], artists: [] });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Arama yapılırken bir hata oluştu');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchFocus = () => {
    setShowSearchDropdown(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ musics: [], playlists: [], artists: [] });
    searchInputRef.current?.focus();
  };

  const handleMusicClick = (music) => {
    console.log('Play music:', music);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="top-navbar">
      {/* Hamburger Menu + Logo */}
      <div className="navbar-left">
        <button className="hamburger-btn" onClick={() => setIsSideMenuOpen(true)}>
          <FiMenu size={24} />
        </button>
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="TrackBang" />
        </div>
      </div>

      {/* Center: Home + Search */}
      <div className="navbar-center">
        <button className="nav-home-btn" onClick={() => navigate('/')}>
          <FiHome size={24} />
        </button>

        <div className="navbar-search" ref={searchRef}>
          <div className="search-input-container">
            <FiSearch className="search-icon-left" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Ne çalmak istiyorsun?"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={handleClearSearch}>
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="search-dropdown">
              <div className="search-dropdown-header">
                <h3>Yakındaki aramalar</h3>
                <div className="search-filter-tabs">
                  <button
                    className={`filter-tab ${activeSearchTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveSearchTab('all')}
                  >
                    Tümü
                  </button>
                  <button
                    className={`filter-tab ${activeSearchTab === 'musics' ? 'active' : ''}`}
                    onClick={() => setActiveSearchTab('musics')}
                  >
                    Müzik
                  </button>
                  <button
                    className={`filter-tab ${activeSearchTab === 'playlists' ? 'active' : ''}`}
                    onClick={() => setActiveSearchTab('playlists')}
                  >
                    Playlist
                  </button>
                  <button
                    className={`filter-tab ${activeSearchTab === 'artists' ? 'active' : ''}`}
                    onClick={() => setActiveSearchTab('artists')}
                  >
                    Kullanıcı
                  </button>
                </div>
              </div>

              {searchLoading ? (
                <div className="search-dropdown-loading">
                  <div className="spinner-small"></div>
                  <p>Aranıyor...</p>
                </div>
              ) : searchQuery && (searchResults.musics?.length > 0 || searchResults.playlists?.length > 0 || searchResults.artists?.length > 0) ? (
                <div className="search-results-dropdown">
                  {/* Musics */}
                  {(activeSearchTab === 'all' || activeSearchTab === 'musics') && searchResults.musics?.length > 0 && (
                    <div className="result-group">
                      <h4 className="result-group-title">Şarkılar</h4>
                      {searchResults.musics.slice(0, activeSearchTab === 'musics' ? 10 : 4).map((music) => (
                        <div
                          key={music._id}
                          className="search-result-row"
                          onClick={() => handleMusicClick(music)}
                        >
                          <div className="result-artwork-small">
                            {music.imageUrl ? (
                              <img src={music.imageUrl} alt={music.title} />
                            ) : (
                              <div className="artwork-placeholder">
                                <FiMusic size={20} />
                              </div>
                            )}
                          </div>
                          <div className="result-info-small">
                            <p className="result-name">{music.title}</p>
                            <p className="result-artist">
                              {music.artists?.map(a => a.name).join(', ') || music.artistNames || 'Unknown Artist'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Playlists */}
                  {(activeSearchTab === 'all' || activeSearchTab === 'playlists') && searchResults.playlists?.length > 0 && (
                    <div className="result-group">
                      <h4 className="result-group-title">Playlistler</h4>
                      {searchResults.playlists.slice(0, activeSearchTab === 'playlists' ? 10 : 4).map((playlist) => (
                        <div
                          key={playlist._id}
                          className="search-result-row"
                          onClick={() => handlePlaylistClick(playlist)}
                        >
                          <div className="result-artwork-small">
                            {playlist.coverImage ? (
                              <img src={playlist.coverImage} alt={playlist.name} />
                            ) : (
                              <div className="artwork-placeholder">
                                <FiDisc size={20} />
                              </div>
                            )}
                          </div>
                          <div className="result-info-small">
                            <p className="result-name">{playlist.name}</p>
                            <p className="result-artist">{playlist.trackCount || 0} şarkı</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Artists */}
                  {(activeSearchTab === 'all' || activeSearchTab === 'artists') && searchResults.artists?.length > 0 && (
                    <div className="result-group">
                      <h4 className="result-group-title">Sanatçılar</h4>
                      {searchResults.artists.slice(0, activeSearchTab === 'artists' ? 10 : 4).map((artist) => (
                        <div
                          key={artist._id}
                          className="search-result-row"
                          onClick={() => navigate(`/artist/${artist.slug || artist._id}`)}
                        >
                          <div className="result-artwork-small round">
                            {artist.imageUrl ? (
                              <img src={artist.imageUrl} alt={artist.name} />
                            ) : (
                              <div className="artwork-placeholder">
                                <FiUser size={20} />
                              </div>
                            )}
                          </div>
                          <div className="result-info-small">
                            <p className="result-name">{artist.name}</p>
                            <p className="result-artist">Sanatçı</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : searchQuery ? (
                <div className="search-dropdown-empty">
                  <FiSearch size={40} />
                  <p>Sonuç bulunamadı</p>
                </div>
              ) : (
                <div className="search-dropdown-empty">
                  <FiSearch size={40} />
                  <p>Ne çalmak istiyorsun?</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="navbar-actions">
        <button className="navbar-btn" onClick={() => navigate('/messages')}>
          <FiMessageCircle size={20} />
          {unreadCount > 0 && <span className="navbar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>

        <button className="navbar-btn" onClick={() => navigate('/notifications')}>
          <FiBell size={20} />
        </button>

        {/* User Profile Dropdown */}
        <div className="navbar-profile-wrapper">
          <div 
            className="navbar-profile" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.username} />
            ) : (
              <div className="profile-placeholder">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-menu-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.username} />
                  ) : (
                    <FiUser size={24} />
                  )}
                </div>
                <div className="user-menu-info">
                  <span className="user-menu-name">{user?.username || 'User'}</span>
                  <span className="user-menu-badge">
                    {user?.badge === 'trackbang' ? '👑 TrackBang Pro' :
                     user?.badge === 'premium' ? '⭐ Premium' :
                     user?.subscriptionStatus === 'trial_active' ? '🆓 Free Trial' : 'Free'}
                  </span>
                </div>
              </div>

              <div className="user-menu-divider" />

              <button className="user-menu-item" onClick={() => navigate('/profile')}>
                <FiUser size={18} />
                <span>Profile</span>
              </button>

              <div className="user-menu-divider" />

              <button className="user-menu-item logout" onClick={handleLogout}>
                <FiLogOut size={18} />
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Side Menu Drawer */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
    </div>
  );
};

export default TopNavbar;