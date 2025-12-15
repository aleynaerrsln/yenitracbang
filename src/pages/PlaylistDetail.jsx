import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistAPI } from '../services/api';  // ← musicController kaldırıldı
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaRandom, FaHeart, FaRegHeart, FaShare, FaClock } from 'react-icons/fa';
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
        // Check if user liked this playlist (userLikes içinde user._id var mı?)
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

    try {
      // API call for like/unlike playlist
      // Burası backend'e göre düzenlenebilir
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: `${playlist.name} - ${playlist.genre}`,
        url: window.location.href,
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="playlist-detail">
        <div className="playlist-header skeleton">
          <div className="skeleton-cover"></div>
          <div className="skeleton-info">
            <div className="skeleton-line"></div>
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
        {/* Cover Image - Sol */}
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

        {/* Playlist Info - Sağ */}
        <div className="playlist-info">
          <span className="playlist-type">
            {playlist.isAdminPlaylist && '👑 Official Playlist'}
            {playlist.isArtistEssential && '⭐ Artist Essential'}
            {!playlist.isAdminPlaylist && !playlist.isArtistEssential && '📁 Public Playlist'}
          </span>
          
          <h1 className="playlist-name">{playlist.name}</h1>
          
          {playlist.description && (
            <p className="playlist-description">{playlist.description}</p>
          )}

          <div className="playlist-meta">
            {/* Owner */}
            <div className="meta-item">
              <div className="owner-avatar">
                {playlist.owner?.profileImage ? (
                  <img src={playlist.owner.profileImage} alt={playlist.owner.displayName} />
                ) : (
                  <span>{playlist.owner?.displayName?.charAt(0) || 'A'}</span>
                )}
              </div>
              <span className="owner-name">{playlist.owner?.displayName || 'Admin'}</span>
            </div>

            <span className="meta-separator">•</span>

            {/* Track Count */}
            <span className="meta-item">
              {playlist.musicCount || playlist.musics?.length || 0} tracks
            </span>

            <span className="meta-separator">•</span>

            {/* Likes */}
            <span className="meta-item">
              ❤️ {formatNumber(playlist.likes || 0)} likes
            </span>

            <span className="meta-separator">•</span>

            {/* Views */}
            <span className="meta-item">
              👁️ {formatNumber(playlist.views || 0)} views
            </span>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-play">
              <FaPlay /> Play All
            </button>

            <button className="btn-shuffle">
              <FaRandom /> Shuffle
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
        </div>
      </div>

      {/* Track List */}
      <div className="track-list-container">
        <div className="track-list-header">
          <div className="header-col track-number">#</div>
          <div className="header-col track-title">Title</div>
          <div className="header-col track-artist">Artist</div>
          <div className="header-col track-album">Playlist</div>
          <div className="header-col track-platforms">Platforms</div>
          <div className="header-col track-duration">
            <FaClock />
          </div>
        </div>

        <div className="track-list">
          {playlist.musics && playlist.musics.length > 0 ? (
            playlist.musics.map((track, index) => (
              <TrackRow 
                key={track._id} 
                track={track} 
                index={index + 1}
                playlistName={playlist.name}
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

// Track Row Component
const TrackRow = ({ track, index, playlistName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const platformIcons = {
    spotify: { icon: <BsSpotify />, color: '#1DB954', name: 'Spotify' },
    appleMusic: { icon: <BsApple />, color: '#FC3C44', name: 'Apple Music' },
    youtubeMusic: { icon: <BsSoundwave />, color: '#FF0000', name: 'YouTube Music' },
    beatport: { icon: <SiBeatport />, color: '#01FF95', name: 'Beatport' },
    soundcloud: { icon: <BsSoundwave />, color: '#FF5500', name: 'SoundCloud' },
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

  return (
    <div 
      className={`track-row ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track Number / Play Button */}
      <div className="track-col track-number">
        {isHovered ? (
          <button 
            className="btn-play-track"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        ) : (
          <span>{index}</span>
        )}
      </div>

      {/* Track Title + Cover */}
      <div className="track-col track-title">
        <div className="track-cover-small">
          {track.imageUrl ? (
            <img src={track.imageUrl} alt={track.title} />
          ) : (
            <span>🎵</span>
          )}
        </div>
        <div className="track-title-text">
          <div className="track-name">{track.title}</div>
        </div>
      </div>

      {/* Artist */}
      <div className="track-col track-artist">
        {track.artist || track.artistNames || 'Unknown Artist'}
      </div>

      {/* Album (Playlist Name) */}
      <div className="track-col track-album">
        {playlistName}
      </div>

      {/* Platform Buttons */}
      <div className="track-col track-platforms">
        <div className="platform-buttons">
          {getPlatformLinks().map(({ platform, url, icon, color, name }) => (
            <button
              key={platform}
              className="platform-btn"
              style={{ '--platform-color': color }}
              onClick={(e) => handlePlatformClick(url, e)}
              title={`Open on ${name}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="track-col track-duration">
        {/* Duration bilgisi backend'de yok, şimdilik varsayılan */}
        3:45
      </div>
    </div>
  );
};

export default PlaylistDetail;