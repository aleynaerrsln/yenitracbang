// src/pages/GenreDetail.jsx - DAHA DOLU VERSİYON

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { genreAPI, playlistAPI } from '../services/api';
import { FiPlay, FiHeart, FiClock } from 'react-icons/fi';
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

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
      {/* Banner */}
      <div 
        className="genre-banner"
        style={{
          backgroundImage: genre.bannerImage ? `url(${genre.bannerImage})` : 'none',
          backgroundColor: genre.color || '#7C3AED'
        }}
      >
        <div className="genre-banner-overlay">
          <h1 className="genre-title">{genre.displayName}</h1>
          <p className="genre-stats">{playlists.length} Playlist</p>
        </div>
      </div>

      {/* Playlists Table */}
      <div className="genre-content">
        {playlists.length === 0 ? (
          <div className="genre-empty">
            <p>Bu kategoride henüz playlist yok</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="playlist-table-header">
              <div className="col-number">#</div>
              <div className="col-title">TITLE</div>
              <div className="col-tracks">TRACKS</div>
              <div className="col-date">DATE ADDED</div>
              <div className="col-duration"><FiClock size={18} /></div>
            </div>

            {/* Table Body */}
            <div className="playlists-table">
              {playlists.map((playlist, index) => (
                <div 
                  key={playlist._id} 
                  className="playlist-table-row"
                  onClick={() => navigate(`/playlist/${playlist._id}`)}
                >
                  {/* Number / Play */}
                  <div className="col-number">
                    <span className="number">{index + 1}</span>
                    <button className="play-btn-small">
                      <FiPlay />
                    </button>
                  </div>

                  {/* Title + Cover */}
                  <div className="col-title">
                    <div className="playlist-cover-small">
                      {playlist.coverImage ? (
                        <img src={playlist.coverImage} alt={playlist.name} />
                      ) : (
                        <div className="cover-placeholder">🎵</div>
                      )}
                    </div>
                    <div className="playlist-info-table">
                      <h3>{playlist.name}</h3>
                      <p>{playlist.description || playlist.genreDisplayName}</p>
                    </div>
                  </div>

                  {/* Tracks */}
                  <div className="col-tracks">
                    {playlist.musicCount} tracks
                  </div>

                  {/* Date */}
                  <div className="col-date">
                    {formatDate(playlist.createdAt)}
                  </div>

                  {/* Stats */}
                  <div className="col-duration">
                    <div className="playlist-stats-inline">
                      <FiHeart size={14} />
                      <span>{playlist.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenreDetail;