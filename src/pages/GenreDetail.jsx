// src/pages/GenreDetail.jsx - DAHA DOLU VERSİYON

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { genreAPI, playlistAPI } from '../services/api';
import { FiPlay } from 'react-icons/fi';
import './GenreDetail.css';

const GenreDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [genre, setGenre] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGenreData();
  }, [slug]);

  const fetchGenreData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [genreRes, playlistsRes] = await Promise.all([
        genreAPI.getGenreBySlug(slug),
        playlistAPI.getPlaylistsByCategory(slug)
      ]);

      setGenre(genreRes.data.data);
      setPlaylists(playlistsRes.data.playlists);
    } catch (err) {
      console.error('Genre fetch error:', err);
      setError('Genre yüklenemedi');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="genre-detail">
        <div className="genre-detail-loading">
          <div className="spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !genre) {
    return (
      <div className="genre-detail">
        <div className="genre-detail-error">
          <h2>😕 Hata</h2>
          <p>{error || 'Genre bulunamadı'}</p>
          <button onClick={() => navigate('/')}>Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className="genre-detail">
      {/* Header */}
      <div className="genre-detail-header">
        <button className="back-btn-genre" onClick={() => navigate('/lists')}>
          ←
        </button>
        <h1 className="genre-detail-title">{genre.displayName}</h1>
        <button className="refresh-btn" onClick={fetchGenreData}>
          ↻
        </button>
      </div>

      {/* Playlists Cards */}
      <div className="genre-playlists">
        {playlists.length === 0 ? (
          <div className="genre-empty">
            <p>Bu kategoride henüz playlist yok</p>
          </div>
        ) : (
          <div className="playlists-card-list">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="playlist-card-item"
                onClick={() => navigate(`/playlist/${playlist._id}`)}
              >
                {/* Cover Image */}
                <div className="playlist-card-cover">
                  {playlist.coverImage ? (
                    <img src={playlist.coverImage} alt={playlist.name} />
                  ) : (
                    <div className="cover-placeholder">
                      <FiPlay size={24} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="playlist-card-info">
                  <h3 className="playlist-card-name">{playlist.name}</h3>
                  <p className="playlist-card-tracks">{playlist.musicCount} tracks</p>
                </div>

                {/* Arrow */}
                <div className="playlist-card-arrow">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenreDetail;