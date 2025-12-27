// src/pages/WorldPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiMusic, FiUser, FiEye } from 'react-icons/fi';
import './WorldPage.css';

const WorldPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const genres = [
    { id: null, name: 'All', label: 'All Genres' },
    { id: 'afrohouse', name: 'Afro House', label: 'Afro House' },
    { id: 'indiedance', name: 'Indie Dance', label: 'Indie Dance' },
    { id: 'organichouse', name: 'Organic House', label: 'Organic House' },
    { id: 'downtempo', name: 'Downtempo', label: 'Downtempo' },
    { id: 'melodichouse', name: 'Melodic House', label: 'Melodic House' }
  ];

  useEffect(() => {
    fetchPlaylists(true);
  }, [selectedGenre]);

  const fetchPlaylists = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;

      const response = await playlistAPI.getPublicWorldPlaylists({
        page: currentPage,
        limit: 20,
        genre: selectedGenre
      });

      if (response.data.success) {
        const newPlaylists = response.data.playlists || [];

        if (reset) {
          setPlaylists(newPlaylists);
          setPage(1);
        } else {
          setPlaylists(prev => [...prev, ...newPlaylists]);
        }

        const pagination = response.data.pagination;
        setHasMore(pagination.currentPage < pagination.totalPages);
      }
    } catch (error) {
      console.error('Fetch world playlists error:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchPlaylists(false);
    }
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setPage(1);
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  return (
    <div className="world-page">
      <div className="world-header">
        <h1>World Playlists</h1>
        <p>Dünyanın her yerinden kullanıcı playlistleri</p>
      </div>

      {/* Genre Filter */}
      <div className="world-genres">
        {genres.map(genre => (
          <button
            key={genre.id || 'all'}
            className={`genre-filter-btn ${selectedGenre === genre.id ? 'active' : ''}`}
            onClick={() => handleGenreChange(genre.id)}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {/* Playlists Grid */}
      <div className="world-content">
        {loading && page === 1 ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-playlist-card"></div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            <FiMusic size={48} />
            <p>Henüz playlist yok</p>
          </div>
        ) : (
          <>
            <div className="world-playlists-grid">
              {playlists.map(playlist => (
                <div
                  key={playlist._id}
                  className="world-playlist-card"
                  onClick={() => handlePlaylistClick(playlist._id)}
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
                      <span className="track-count">
                        {playlist.musicCount || 0} tracks
                      </span>
                    </div>
                  </div>

                  <div className="playlist-info">
                    <h3 className="playlist-name">{playlist.name}</h3>

                    {playlist.owner && (
                      <div className="playlist-owner">
                        <FiUser size={14} />
                        <span>{playlist.owner.displayName || playlist.owner.username}</span>
                      </div>
                    )}

                    {playlist.description && (
                      <p className="playlist-description">{playlist.description}</p>
                    )}

                    <div className="playlist-stats">
                      <span className="stat-item">
                        <FiEye size={14} />
                        {playlist.views || 0}
                      </span>
                      {playlist.genreDisplayName && (
                        <span className="genre-badge">{playlist.genreDisplayName}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="load-more-section">
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorldPage;
