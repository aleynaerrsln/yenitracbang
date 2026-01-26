// src/pages/WorldPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiMusic, FiHeart, FiPlay } from 'react-icons/fi';
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

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`, { state: { playlist } });
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
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  {/* Playlist Cover */}
                  <div className="playlist-cover">
                    {/* Track Count Badge - Inside cover for overlay effect */}
                    <div className="track-badge">
                      {playlist.musicCount || 0} tracks
                    </div>

                    {playlist.coverImage ? (
                      <img src={playlist.coverImage} alt={playlist.name} />
                    ) : (
                      <div className="cover-placeholder">
                        <FiMusic size={32} />
                      </div>
                    )}
                    {/* Play Overlay */}
                    <button
                      className="play-overlay"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaylistClick(playlist);
                      }}
                    >
                      <FiPlay size={24} />
                    </button>
                  </div>

                  {/* Playlist Info */}
                  <div className="playlist-info">
                    <h3 className="playlist-name">{playlist.name}</h3>
                    <p className="playlist-owner">
                      {playlist.owner?.displayName || playlist.owner?.username || 'Unknown'}
                    </p>
                  </div>

                  {/* Playlist Stats */}
                  <div className="playlist-stats">
                    <button className="like-btn">
                      <FiHeart size={16} />
                      <span>{playlist.likes || 0}</span>
                    </button>
                    <span className="views-count">{playlist.views || 0} views</span>
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
