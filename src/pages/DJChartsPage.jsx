// src/pages/DJChartsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistEssentialAPI, musicAPI } from '../services/api';
import { FiHeart, FiPlay, FiMusic, FiUser, FiTrendingUp } from 'react-icons/fi';
import { SiSpotify } from 'react-icons/si';
import { toast } from 'react-hot-toast';
import './DJChartsPage.css';

const DJChartsPage = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('likes'); // 'likes', 'views', 'recent'
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    fetchApprovedPlaylists();
  }, [sortBy]);

  const fetchApprovedPlaylists = async () => {
    try {
      setLoading(true);
      const response = await artistEssentialAPI.getApprovedPlaylists({ sortBy, limit: 50 });
      console.log('DJ Charts response:', response.data);
      const data = response.data?.data?.playlists || response.data?.playlists || [];
      setPlaylists(data);
    } catch (error) {
      console.error('Failed to fetch DJ Charts:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(selectedPlaylist?._id === playlist._id ? null : playlist);
  };

  const handleSpotifyClick = (url, e) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleArtistClick = (artistId, e) => {
    e.stopPropagation();
    if (artistId) {
      navigate(`/profile/${artistId}`);
    }
  };

  const handleLikeMusic = async (musicId, e) => {
    e.stopPropagation();
    try {
      await musicAPI.likeMusic(musicId);
      // Update local state
      setPlaylists(prev => prev.map(playlist => ({
        ...playlist,
        musics: playlist.musics?.map(m =>
          m._id === musicId
            ? { ...m, isLiked: !m.isLiked, likes: m.isLiked ? (m.likes || 1) - 1 : (m.likes || 0) + 1 }
            : m
        )
      })));
    } catch (error) {
      console.error('Like error:', error);
      toast.error('İşlem başarısız');
    }
  };

  if (loading) {
    return (
      <div className="dj-charts-page">
        <div className="dj-charts-header">
          <h1><FiTrendingUp /> DJ Charts</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dj-charts-page">
      {/* Header */}
      <div className="dj-charts-header">
        <div className="header-content">
          <h1><FiTrendingUp /> DJ Charts</h1>
          <p className="header-subtitle">DJ'lerin özenle seçtiği playlistler</p>
        </div>

        {/* Sort Options */}
        <div className="sort-options">
          <button
            className={`sort-btn ${sortBy === 'likes' ? 'active' : ''}`}
            onClick={() => setSortBy('likes')}
          >
            <FiHeart size={14} /> Popüler
          </button>
          <button
            className={`sort-btn ${sortBy === 'views' ? 'active' : ''}`}
            onClick={() => setSortBy('views')}
          >
            <FiPlay size={14} /> En Çok İzlenen
          </button>
          <button
            className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
            onClick={() => setSortBy('recent')}
          >
            <FiMusic size={14} /> Yeni
          </button>
        </div>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiMusic size={48} />
          </div>
          <h3>Henüz DJ Chart yok</h3>
          <p>DJ'ler yakında playlist paylaşacak</p>
        </div>
      ) : (
        <div className="playlists-container">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="chart-card">
              {/* Playlist Header */}
              <div
                className="chart-header"
                onClick={() => handlePlaylistClick(playlist)}
              >
                <div className="chart-cover">
                  {playlist.coverImage ? (
                    <img src={playlist.coverImage} alt={playlist.name} />
                  ) : (
                    <div className="cover-placeholder">
                      <FiMusic size={32} />
                    </div>
                  )}
                </div>
                <div className="chart-info">
                  <h3 className="chart-name">{playlist.name}</h3>
                  <div
                    className="chart-artist"
                    onClick={(e) => handleArtistClick(playlist.artist?.username, e)}
                  >
                    {playlist.artist?.profileImage ? (
                      <img
                        src={playlist.artist.profileImage}
                        alt={playlist.artist.displayName}
                        className="artist-avatar"
                      />
                    ) : (
                      <div className="artist-avatar-placeholder">
                        <FiUser size={12} />
                      </div>
                    )}
                    <span>{playlist.artist?.displayName || playlist.artist?.username || 'Unknown DJ'}</span>
                    {playlist.artist?.badge && (
                      <span className={`badge badge-${playlist.artist.badge}`}>
                        {playlist.artist.badge}
                      </span>
                    )}
                  </div>
                  <div className="chart-stats">
                    <span><FiMusic size={12} /> {playlist.musicCount || 0} şarkı</span>
                    <span><FiHeart size={12} /> {playlist.likes || 0}</span>
                  </div>
                </div>
                <div className="expand-icon">
                  {selectedPlaylist?._id === playlist._id ? '▲' : '▼'}
                </div>
              </div>

              {/* Playlist Description */}
              {playlist.description && (
                <p className="chart-description">{playlist.description}</p>
              )}

              {/* Expanded Tracks */}
              {selectedPlaylist?._id === playlist._id && (
                <div className="chart-tracks">
                  {playlist.musics && playlist.musics.length > 0 ? (
                    playlist.musics.map((music, index) => (
                      <div key={music._id} className="track-item">
                        <span className="track-number">{index + 1}</span>
                        <img
                          src={music.imageUrl}
                          alt={music.title}
                          className="track-cover"
                        />
                        <div className="track-info">
                          <span className="track-title">{music.title}</span>
                          <span className="track-artist">{music.artistNames || music.artist}</span>
                        </div>
                        <div className="track-actions">
                          {music.platformLinks?.spotify && (
                            <button
                              className="spotify-btn"
                              onClick={(e) => handleSpotifyClick(music.platformLinks.spotify, e)}
                            >
                              <SiSpotify size={16} />
                            </button>
                          )}
                          <button
                            className="like-btn"
                            onClick={(e) => handleLikeMusic(music._id, e)}
                          >
                            <FiHeart
                              size={16}
                              fill={music.isLiked ? '#FF6B6B' : 'none'}
                              color={music.isLiked ? '#FF6B6B' : 'currentColor'}
                            />
                            <span>{music.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-tracks">
                      <p>Bu playlist'te şarkı yok</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DJChartsPage;
