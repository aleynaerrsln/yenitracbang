// src/pages/PlaylistDetail.jsx - MOBİL GİBİ KART LAYOUT
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { BsSpotify, BsApple, BsSoundwave } from 'react-icons/bs';
import { SiBeatport } from 'react-icons/si';
import { FiMoreVertical } from 'react-icons/fi';
import TrackOptionsModal from '../components/modals/TrackOptionsModal';
import SelectArtistModal from '../components/modals/SelectArtistModal';
import ShareModal from '../components/modals/ShareModal';
import './PlaylistDetail.css';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedPlaylist = location.state?.playlist;

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showTrackOptions, setShowTrackOptions] = useState(false);
  const [showSelectArtist, setShowSelectArtist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

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

  const handleOpenOptions = (track, e) => {
    e.stopPropagation();

    const buttonRect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: buttonRect.top,
      left: buttonRect.left
    });

    setSelectedTrack(track);
    setShowTrackOptions(true);
  };

  const handleViewArtists = () => {
    if (selectedTrack?.artists && selectedTrack.artists.length > 0) {
      // TrackOptionsModal'ı kapat, SelectArtistModal'ı aç
      setShowTrackOptions(false);
      setShowSelectArtist(true);
    } else {
      console.log('No artists found for this track');
    }
  };

  const handleAddToPlaylist = () => {
    console.log('Add to Playlist:', selectedTrack?.title);
  };

  const handleShare = () => {
    // TrackOptionsModal'ı kapat, ShareModal'ı aç
    setShowTrackOptions(false);
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="playlist-detail">
        <div className="playlist-header skeleton">
          <div className="cover-container">
            <div className="skeleton-cover"></div>
          </div>
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
        <button className="btn-back-arrow" onClick={() => navigate(-1)}>
          ‹
        </button>

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
          <h1 className="playlist-name">{playlist.name}</h1>

          <div className="playlist-meta">
            <div className="meta-item owner-row">
              <div className="owner-avatar">
                {(passedPlaylist?.owner?.profileImage || playlist.owner?.profileImage) ? (
                  <img
                    src={passedPlaylist?.owner?.profileImage || playlist.owner?.profileImage}
                    alt={(passedPlaylist?.owner?.displayName && passedPlaylist.owner.displayName !== 'User' ? passedPlaylist.owner.displayName : null) ||
                         (playlist.owner?.displayName && playlist.owner.displayName !== 'User' ? playlist.owner.displayName : null) ||
                         passedPlaylist?.owner?.username || playlist.owner?.username || 'Owner'}
                  />
                ) : (
                  <span>{((passedPlaylist?.owner?.displayName && passedPlaylist.owner.displayName !== 'User' ? passedPlaylist.owner.displayName : null) ||
                         (playlist.owner?.displayName && playlist.owner.displayName !== 'User' ? playlist.owner.displayName : null) ||
                         passedPlaylist?.owner?.username || playlist.owner?.username || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="owner-name">
                {(passedPlaylist?.owner?.displayName && passedPlaylist.owner.displayName !== 'User' ? passedPlaylist.owner.displayName : null) ||
                 (playlist.owner?.displayName && playlist.owner.displayName !== 'User' ? playlist.owner.displayName : null) ||
                 passedPlaylist?.owner?.username || playlist.owner?.username || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="track-count">
            {playlist.musicCount || playlist.musics?.length || 0} tracks
          </div>
        </div>
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
                onOpenOptions={handleOpenOptions}
              />
            ))
          ) : (
            <div className="empty-tracks">
              <p>Bu playlist'te henüz şarkı yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Track Options Modal */}
      <TrackOptionsModal
        isOpen={showTrackOptions}
        onClose={() => setShowTrackOptions(false)}
        onViewArtists={handleViewArtists}
        onAddToPlaylist={handleAddToPlaylist}
        onShare={handleShare}
        position={menuPosition}
      />

      {/* Select Artist Modal */}
      <SelectArtistModal
        isOpen={showSelectArtist}
        onClose={() => setShowSelectArtist(false)}
        artists={selectedTrack?.artists || []}
        trackInfo={selectedTrack ? {
          title: selectedTrack.title,
          imageUrl: selectedTrack.imageUrl
        } : null}
        position={menuPosition}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        trackInfo={selectedTrack ? {
          id: selectedTrack._id,
          title: selectedTrack.title,
          artist: selectedTrack.artist || selectedTrack.artistNames || 'Unknown Artist',
          imageUrl: selectedTrack.imageUrl
        } : null}
        position={menuPosition}
      />
    </div>
  );
};

// Track Card Component (Mobil Benzeri)
const TrackCard = ({ track, onOpenOptions }) => {
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

      {/* 3-Dot Menu */}
      <button
        className="btn-track-menu"
        onClick={(e) => onOpenOptions(track, e)}
      >
        <FiMoreVertical size={20} />
      </button>
    </div>
  );
};

export default PlaylistDetail;
