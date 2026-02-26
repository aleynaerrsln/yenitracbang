// src/pages/MusicDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { musicAPI } from '../services/api';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { BsSpotify, BsApple, BsSoundwave } from 'react-icons/bs';
import { SiBeatport } from 'react-icons/si';
import { FiMoreVertical, FiUser } from 'react-icons/fi';
import TrackOptionsModal from '../components/modals/TrackOptionsModal';
import SelectArtistModal from '../components/modals/SelectArtistModal';
import ShareModal from '../components/modals/ShareModal';
import './MusicDetailPage.css';

const MusicDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // Modal states
  const [showTrackOptions, setShowTrackOptions] = useState(false);
  const [showSelectArtist, setShowSelectArtist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    fetchMusic();
  }, [id]);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await musicAPI.getMusicById(id);

      if (response.data.success) {
        const data = response.data.data?.music || response.data.music;
        setMusic(data);
        setIsLiked(data.isLiked || false);
      } else {
        setError('Şarkı bulunamadı');
      }
    } catch (err) {
      console.error('Music fetch error:', err);
      setError('Şarkı yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await musicAPI.likeMusic(id);
      setIsLiked(!isLiked);
      setMusic(prev => ({
        ...prev,
        likes: isLiked ? (prev.likes || 1) - 1 : (prev.likes || 0) + 1
      }));
      window.dispatchEvent(new CustomEvent('top10Updated'));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handlePlatformClick = (url) => {
    if (url) window.open(url, '_blank');
  };

  const handleArtistClick = (artist) => {
    if (artist.slug) {
      navigate(`/artist/${artist.slug}`);
    } else if (artist._id) {
      navigate(`/artist/${artist._id}`);
    }
  };

  const handleOpenOptions = (e) => {
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: buttonRect.top, left: buttonRect.left });
    setShowTrackOptions(true);
  };

  const handleViewArtists = () => {
    if (music?.artists && music.artists.length > 0) {
      setShowTrackOptions(false);
      setShowSelectArtist(true);
    }
  };

  const handleShare = () => {
    setShowTrackOptions(false);
    setShowShareModal(true);
  };

  const platformIcons = {
    spotify: { icon: <BsSpotify />, className: 'spotify', name: 'Spotify' },
    appleMusic: { icon: <BsApple />, className: 'apple', name: 'Apple Music' },
    youtubeMusic: { icon: <BsSoundwave />, className: 'youtube', name: 'YouTube Music' },
    beatport: { icon: <SiBeatport />, className: 'beatport', name: 'Beatport' },
    soundcloud: { icon: <BsSoundwave />, className: 'soundcloud', name: 'SoundCloud' },
  };

  const getPlatformLinks = () => {
    if (!music?.platformLinks) return [];
    return Object.entries(music.platformLinks)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([platform, url]) => ({
        platform,
        url,
        ...platformIcons[platform]
      }));
  };

  if (loading) {
    return (
      <div className="music-detail-page">
        <div className="music-detail-skeleton">
          <div className="skeleton-cover-lg"></div>
          <div className="skeleton-info-lg">
            <div className="skeleton-line-lg"></div>
            <div className="skeleton-line-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !music) {
    return (
      <div className="music-detail-page">
        <div className="music-detail-error">
          <h2>{error || 'Şarkı bulunamadı'}</h2>
          <button onClick={() => navigate(-1)} className="btn-back">Geri Dön</button>
        </div>
      </div>
    );
  }

  const links = getPlatformLinks();
  const artistNames = music.artists?.map(a => a.name).join(', ') || music.artistNames || music.artist || 'Unknown Artist';

  return (
    <div className="music-detail-page">
      {/* Back Button */}
      <button className="music-detail-back" onClick={() => navigate(-1)}>‹</button>

      {/* Hero Section */}
      <div className="music-detail-hero">
        <div className="music-detail-cover">
          {music.imageUrl ? (
            <img src={music.imageUrl} alt={music.title} />
          ) : (
            <div className="music-detail-cover-placeholder">🎵</div>
          )}
        </div>

        <div className="music-detail-info">
          <h1 className="music-detail-title">{music.title}</h1>

          {/* Artists */}
          <div className="music-detail-artists">
            {music.artists && music.artists.length > 0 ? (
              music.artists.map((artist) => (
                <button
                  key={artist._id}
                  className="music-detail-artist"
                  onClick={() => handleArtistClick(artist)}
                >
                  {artist.profileImage ? (
                    <img src={artist.profileImage} alt={artist.name} className="artist-img" />
                  ) : (
                    <div className="artist-img-placeholder"><FiUser size={12} /></div>
                  )}
                  <span>{artist.name}</span>
                </button>
              ))
            ) : (
              <span className="music-detail-artist-text">{artistNames}</span>
            )}
          </div>

          {/* Genre + Stats */}
          <div className="music-detail-meta">
            {music.genre && <span className="music-genre-tag">{music.genre}</span>}
            <span className="music-stat">{music.likes || 0} beğeni</span>
            <span className="music-stat">{music.views || 0} görüntülenme</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="music-detail-actions">
        <button className={`music-like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{isLiked ? 'Beğenildi' : 'Beğen'}</span>
        </button>

        <button className="music-options-btn" onClick={handleOpenOptions}>
          <FiMoreVertical size={20} />
        </button>
      </div>

      {/* Platform Links */}
      {links.length > 0 && (
        <div className="music-detail-platforms">
          <h3>Dinle</h3>
          <div className="platform-links-list">
            {links.map(({ platform, url, icon, className, name }) => (
              <button
                key={platform}
                className={`platform-link-btn ${className}`}
                onClick={() => handlePlatformClick(url)}
              >
                <span className="platform-icon">{icon}</span>
                <span className="platform-name">{name}</span>
                <span className="platform-arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Label Info */}
      {music.labelId && (
        <div className="music-detail-label">
          <span className="label-text">Label:</span>
          <span className="label-name">{music.labelId.name}</span>
        </div>
      )}

      {/* Modals */}
      <TrackOptionsModal
        isOpen={showTrackOptions}
        onClose={() => setShowTrackOptions(false)}
        onViewArtists={handleViewArtists}
        onAddToPlaylist={() => {}}
        onShare={handleShare}
        position={menuPosition}
      />

      <SelectArtistModal
        isOpen={showSelectArtist}
        onClose={() => setShowSelectArtist(false)}
        artists={music?.artists || []}
        trackInfo={{ title: music.title, imageUrl: music.imageUrl }}
        position={menuPosition}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        trackInfo={{
          id: music._id,
          title: music.title,
          artist: artistNames,
          imageUrl: music.imageUrl
        }}
        position={menuPosition}
      />
    </div>
  );
};

export default MusicDetailPage;
