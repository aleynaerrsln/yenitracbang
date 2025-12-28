// src/pages/HotPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiMusic } from 'react-icons/fi';
import './HotPage.css';

const HotPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [hotPlaylists, setHotPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Her genre için trending playlists çek (limit=10 her genre'den)
      const genres = ['afrohouse', 'indiedance', 'organichouse', 'downtempo', 'melodichouse'];
      const playlistPromises = genres.map(genre =>
        hotAPI.getTrending({ limit: 10, genre })
      );

      const results = await Promise.all(playlistPromises);

      // Tüm playlists'leri birleştir
      const allPlaylists = [];
      results.forEach(res => {
        if (res.data.success && res.data.playlists) {
          allPlaylists.push(...res.data.playlists);
        }
      });

      setHotPlaylists(allPlaylists);

    } catch (error) {
      console.error('Fetch hot data error:', error);
      toast.error('Failed to load hot playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleViewAll = (genreDisplayName) => {
    // Genre display name'den slug'a çevir
    const genreSlugMap = {
      'Afro House': 'afrohouse',
      'Indie Dance': 'indiedance',
      'Organic House': 'organichouse',
      'Down Tempo': 'downtempo',
      'Melodic House': 'melodichouse'
    };

    const genreSlug = genreSlugMap[genreDisplayName];
    if (genreSlug) {
      navigate(`/genre/${genreSlug}`);
    }
  };

  // Group playlists by genre
  const genreGroups = hotPlaylists.reduce((acc, playlist) => {
    const genre = playlist.genreDisplayName || 'Other';
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push(playlist);
    return acc;
  }, {});

  return (
    <div className="hot-page">
      <div className="hot-header">
        <h1>Hot Playlists</h1>
        <p>Trend playlistler kategorilere göre</p>
      </div>

      {loading ? (
        <div className="loading-state">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-section">
              <div className="skeleton-header"></div>
              <div className="skeleton-grid">
                {[1, 2, 3].map(j => (
                  <div key={j} className="skeleton-card"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {Object.entries(genreGroups).map(([genreName, playlists]) => (
            <div key={genreName} className="genre-section">
              <div className="genre-header">
                <h2>{genreName}</h2>
                <button
                  className="view-all-btn"
                  onClick={() => handleViewAll(genreName)}
                >
                  View All
                </button>
              </div>

              <div className="playlists-grid">
                {playlists.map(playlist => (
                  <div
                    key={playlist._id}
                    className="hot-playlist-card"
                    onClick={() => handlePlaylistClick(playlist._id)}
                  >
                    <div className="playlist-cover">
                      {playlist.coverImage ? (
                        <img src={playlist.coverImage} alt={playlist.name} />
                      ) : (
                        <div className="cover-placeholder">
                          <FiMusic size={28} />
                        </div>
                      )}
                      <div className="play-button-overlay">
                        <div className="play-button">
                          <FiMusic size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="playlist-info">
                      <div className="playlist-name">{playlist.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default HotPage;
