// src/pages/PlaylistDetail.jsx - MOBİL GİBİ KART LAYOUT
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaRandom, FaHeart, FaRegHeart, FaShare } from 'react-icons/fa';
import { BsSpotify, BsApple, BsSoundwave } from 'react-icons/bs';
import { SiBeatport } from 'react-icons/si';
import './PlaylistDetail.css';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await playlistAPI.getPlaylistById(id);
      
      if (response.data.success) {
        setPlaylist(response.data.playlist);
        setIsLiked(response.data.playlist.userLikes?.includes(user?._id));
      } else {
        setError('Playlist bulunamadı');
      }
    } catch (err) {
      console.error('Playlist fetch error:', err);
      setError('Playlist yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: `${playlist.name} - ${playlist.genre}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  if (loading) {
    return (
      <div className="playlist-detail">
        <div className="playlist-header skeleton">
          <div className="skeleton-cover"></div>
          <div className="skeleton-info">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="playlist-detail">
        <div className="error-state">
          <h2>😕 {error || 'Playlist bulunamadı'}</h2>
          <button onClick={() => navigate(-1)} className="btn-back">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-detail">
      {/* Playlist Header */}
      <div className="playlist-header">
        <div className="cover-container">
          {playlist.coverImage ? (
            <img 
              src={playlist.coverImage} 
              alt={playlist.name}
              className="playlist-cover"
            />
          ) : (
            <div className="default-cover">
              🎵
            </div>
          )}
        </div>

        <div className="playlist-info">
          <span className="playlist-type">
            {playlist.isAdminPlaylist && '👑 OFFICIAL PLAYLIST'}
            {playlist.isArtistEssential && '⭐ ARTIST ESSENTIAL'}
            {!playlist.isAdminPlaylist && !playlist.isArtistEssential && '📁 PUBLIC PLAYLIST'}
          </span>
          
          <h1 className="playlist-name">{playlist.name}</h1>
          
          {playlist.description && (
            <p className="playlist-description">{playlist.description}</p>
          )}

          <div className="playlist-meta">
            <div className="meta-item">
              <div className="owner-avatar">
                {playlist.owner?.profileImage ? (
                  <img src={playlist.owner.profileImage} alt={playlist.owner.displayName} />
                ) : (
                  <span>{playlist.owner?.displayName?.charAt(0) || 'A'}</span>
                )}
              </div>
              <span className="owner-name">{playlist.owner?.displayName || 'Admin User'}</span>
            </div>

            <span className="meta-separator">•</span>
            <span className="meta-item">
              {playlist.musicCount || playlist.musics?.length || 0} tracks
            </span>

            <span className="meta-separator">•</span>
            <span className="meta-item">
              ❤️ {formatNumber(playlist.likes || 0)} likes
            </span>

            <span className="meta-separator">•</span>
            <span className="meta-item">
              👁️ {formatNumber(playlist.views || 0)} views
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-play">
          <FaPlay />
        </button>

        <button className="btn-shuffle">
          <FaRandom />
        </button>

        <button 
          className={`btn-like ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
        </button>

        <button className="btn-share" onClick={handleShare}>
          <FaShare />
        </button>
      </div>

      {/* Track List */}
      <div className="track-list-container">
        <div className="track-list-header">
          <h3>Tracks ({playlist.musics?.length || 0})</h3>
        </div>

        <div className="track-list">
          {playlist.musics && playlist.musics.length > 0 ? (
            playlist.musics.map((track) => (
              <TrackCard 
                key={track._id} 
                track={track}
              />
            ))
          ) : (
            <div className="empty-tracks">
              <p>Bu playlist'te henüz şarkı yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Track Card Component (Mobil Benzeri)
const TrackCard = ({ track }) => {
  const [isLiked, setIsLiked] = useState(false);

  const platformIcons = {
    spotify: { icon: <BsSpotify />, class: 'spotify', name: 'Spotify' },
    appleMusic: { icon: <BsApple />, class: 'apple', name: 'Apple Music' },
    youtubeMusic: { icon: <BsSoundwave />, class: 'youtube', name: 'YouTube Music' },
    beatport: { icon: <SiBeatport />, class: 'beatport', name: 'Beatport' },
    soundcloud: { icon: <BsSoundwave />, class: 'soundcloud', name: 'SoundCloud' },
  };

  const getPlatformLinks = () => {
    if (!track.platformLinks) return [];
    
    return Object.entries(track.platformLinks)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([platform, url]) => ({
        platform,
        url,
        ...platformIcons[platform]
      }));
  };

  const handlePlatformClick = (url, e) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div className="track-card">
      {/* Track Cover */}
      <div className="track-cover-small">
        {track.imageUrl ? (
          <img src={track.imageUrl} alt={track.title} />
        ) : (
          <span>🎵</span>
        )}
      </div>

      {/* Track Info */}
      <div className="track-info">
        <div className="track-name">{track.title}</div>
        <div className="track-artist">
          {track.artist || track.artistNames || 'Unknown Artist'}
        </div>
      </div>

      {/* Platform Buttons */}
      <div className="track-platforms">
        {getPlatformLinks().map(({ platform, url, icon, class: className, name }) => (
          <button
            key={platform}
            className={`platform-btn ${className}`}
            onClick={(e) => handlePlatformClick(url, e)}
            title={`Open on ${name}`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Like Button */}
      <div className="track-like">
        <button 
          className={`btn-track-like ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
        </button>
        <span className="like-count">{track.likes || 0}</span>
      </div>
    </div>
  );
};

export default PlaylistDetail;