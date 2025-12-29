// src/pages/SearchPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiSearch, FiX, FiMusic, FiUser, FiDisc } from 'react-icons/fi';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    musics: [],
    playlists: [],
    artists: [],
    users: []
  });

  const tabs = [
    { id: 'all', label: 'Tümü', icon: FiSearch },
    { id: 'musics', label: 'Şarkılar', icon: FiMusic },
    { id: 'playlists', label: 'Playlistler', icon: FiDisc },
    { id: 'artists', label: 'Sanatçılar', icon: FiUser }
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (query.trim()) {
      const debounce = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults({ musics: [], playlists: [], artists: [], users: [] });
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await searchAPI.searchAll(searchQuery);

      if (response.data.success) {
        setResults(response.data.results || {
          musics: [],
          playlists: [],
          artists: [],
          users: []
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Arama yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    setResults({ musics: [], playlists: [], artists: [], users: [] });
    inputRef.current?.focus();
  };

  const handleMusicClick = (music) => {
    console.log('Play music:', music);
  };

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`);
  };

  const handleArtistClick = (artist) => {
    navigate(`/artist/${artist.slug || artist._id}`);
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    return { [activeTab]: results[activeTab] || [] };
  };

  const renderMusicItem = (music) => (
    <div key={music._id} className="search-result-item" onClick={() => handleMusicClick(music)}>
      <div className="result-artwork">
        {music.imageUrl ? (
          <img src={music.imageUrl} alt={music.title} />
        ) : (
          <div className="result-placeholder">
            <FiMusic size={24} />
          </div>
        )}
      </div>
      <div className="result-info">
        <h3 className="result-title">{music.title}</h3>
        <p className="result-subtitle">
          {music.artists?.map(a => a.name).join(', ') || music.artistNames || 'Unknown Artist'}
        </p>
      </div>
      <span className="result-type">Şarkı</span>
    </div>
  );

  const renderPlaylistItem = (playlist) => (
    <div key={playlist._id} className="search-result-item" onClick={() => handlePlaylistClick(playlist)}>
      <div className="result-artwork">
        {playlist.coverImage ? (
          <img src={playlist.coverImage} alt={playlist.name} />
        ) : (
          <div className="result-placeholder">
            <FiDisc size={24} />
          </div>
        )}
      </div>
      <div className="result-info">
        <h3 className="result-title">{playlist.name}</h3>
        <p className="result-subtitle">
          {playlist.trackCount || 0} şarkı
        </p>
      </div>
      <span className="result-type">Playlist</span>
    </div>
  );

  const renderArtistItem = (artist) => (
    <div key={artist._id} className="search-result-item" onClick={() => handleArtistClick(artist)}>
      <div className="result-artwork round">
        {artist.imageUrl ? (
          <img src={artist.imageUrl} alt={artist.name} />
        ) : (
          <div className="result-placeholder">
            <FiUser size={24} />
          </div>
        )}
      </div>
      <div className="result-info">
        <h3 className="result-title">{artist.name}</h3>
        <p className="result-subtitle">Sanatçı</p>
      </div>
      <span className="result-type">Sanatçı</span>
    </div>
  );

  const renderResults = () => {
    const filtered = getFilteredResults();
    const hasResults = Object.values(filtered).some(arr => arr && arr.length > 0);

    if (!query.trim()) {
      return (
        <div className="search-empty">
          <FiSearch size={64} />
          <h2>Ne çalmak istiyorsun?</h2>
          <p>Şarkı, sanatçı veya playlist ara</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Aranıyor...</p>
        </div>
      );
    }

    if (!hasResults) {
      return (
        <div className="search-empty">
          <FiSearch size={64} />
          <h2>Sonuç bulunamadı</h2>
          <p>"{query}" için sonuç bulunamadı</p>
        </div>
      );
    }

    return (
      <div className="search-results">
        {activeTab === 'all' ? (
          <>
            {filtered.musics?.length > 0 && (
              <div className="result-section">
                <h2 className="section-title">Şarkılar</h2>
                <div className="result-list">
                  {filtered.musics.slice(0, 5).map(renderMusicItem)}
                </div>
              </div>
            )}

            {filtered.playlists?.length > 0 && (
              <div className="result-section">
                <h2 className="section-title">Playlistler</h2>
                <div className="result-list">
                  {filtered.playlists.slice(0, 5).map(renderPlaylistItem)}
                </div>
              </div>
            )}

            {filtered.artists?.length > 0 && (
              <div className="result-section">
                <h2 className="section-title">Sanatçılar</h2>
                <div className="result-list">
                  {filtered.artists.slice(0, 5).map(renderArtistItem)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="result-section">
            <div className="result-list">
              {activeTab === 'musics' && filtered.musics?.map(renderMusicItem)}
              {activeTab === 'playlists' && filtered.playlists?.map(renderPlaylistItem)}
              {activeTab === 'artists' && filtered.artists?.map(renderArtistItem)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Ne çalmak istiyorsun?"
            value={query}
            onChange={handleSearchChange}
          />
          {query && (
            <button className="search-clear" onClick={handleClear}>
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="search-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="search-content">
        {renderResults()}
      </div>
    </div>
  );
};

export default SearchPage;
