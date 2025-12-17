// src/components/tracks/TrackCard.jsx - PLAYLIST TRACK KARTI

import { FiHeart, FiMoreVertical, FiMusic } from 'react-icons/fi';
import { SiSpotify, SiApplemusic, SiSoundcloud } from 'react-icons/si';
import './TrackCard.css';

const TrackCard = ({ track, onLike }) => {
  const openLink = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="track-card">
      {/* Track Cover */}
      <div className="track-card-cover">
        {track.imageUrl ? (
          <img src={track.imageUrl} alt={track.title} />
        ) : (
          <div className="track-cover-fallback">♪</div>
        )}
      </div>

      {/* Track Info */}
      <div className="track-card-info">
        <h3>{track.title}</h3>
        <p>{track.artist || 'Unknown Artist'}</p>

        {/* Platform Buttons */}
        <div className="platform-buttons">
          {track.platformLinks?.spotify && (
            <button 
              className="platform-btn spotify"
              onClick={() => openLink(track.platformLinks.spotify)}
            >
              <SiSpotify size={18} />
              <span>Spotify</span>
            </button>
          )}
          
          {track.platformLinks?.beatport && (
            <button 
              className="platform-btn beatport"
              onClick={() => openLink(track.platformLinks.beatport)}
            >
              <FiMusic size={18} />
              <span>Beatport</span>
            </button>
          )}

          {track.platformLinks?.appleMusic && (
            <button 
              className="platform-btn apple"
              onClick={() => openLink(track.platformLinks.appleMusic)}
            >
              <SiApplemusic size={18} />
              <span>Apple</span>
            </button>
          )}

          {track.platformLinks?.soundcloud && (
            <button 
              className="platform-btn soundcloud"
              onClick={() => openLink(track.platformLinks.soundcloud)}
            >
              <SiSoundcloud size={18} />
              <span>SoundCloud</span>
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="track-card-actions">
        <button className="action-icon more">
          <FiMoreVertical size={20} />
        </button>
        <button 
          className="action-icon like"
          onClick={() => onLike && onLike(track)}
        >
          <FiHeart size={20} />
          <span className="like-count">{track.likes || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default TrackCard;