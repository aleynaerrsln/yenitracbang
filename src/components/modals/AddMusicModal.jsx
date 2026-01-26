// src/components/modals/AddMusicModal.jsx
import React, { useState } from 'react';
import { artistMusicAPI } from '../../services/api';
import './AddMusicModal.css';

const AddMusicModal = ({ isOpen, onClose, onSave }) => {
  const [spotifyLink, setSpotifyLink] = useState('');
  const [appleMusicLink, setAppleMusicLink] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genres = [
    'Afro House',
    'Indie Dance',
    'Organic House',
    'Down Tempo',
    'Melodic House'
  ];

  const handleSpotifyLinkChange = async (value) => {
    setSpotifyLink(value);
    setError('');

    // Spotify link formatı kontrolü (intl-tr gibi dil kodlarını da destekle)
    if (value && (value.includes('open.spotify.com/track/') || value.includes('open.spotify.com/intl-'))) {
      console.log('🔍 Spotify link detected:', value);
      await fetchSpotifyMetadata(value);
    }
  };

  const fetchSpotifyMetadata = async (link) => {
    setLoading(true);
    setError('');
    setSongData(null);

    try {
      // Spotify track ID'sini çıkar (intl-tr gibi dil kodlarını handle et)
      const trackIdMatch = link.match(/\/track\/([a-zA-Z0-9]+)/);
      const trackId = trackIdMatch ? trackIdMatch[1] : null;

      if (!trackId) {
        setError('Geçersiz Spotify linki');
        setLoading(false);
        return;
      }

      console.log('🎵 Extracted track ID:', trackId);
      console.log('🎵 Fetching metadata for track ID:', trackId);

      // Backend'den metadata çek
      const response = await artistMusicAPI.getSpotifyMetadata(trackId);
      console.log('✅ Full Spotify response:', response);

      // Backend response'u parse et
      let backendData;

      if (response.data?.success && response.data?.data) {
        backendData = response.data.data;
      } else if (response.data?.id && response.data?.name) {
        backendData = response.data;
      } else if (response.data?.track) {
        backendData = response.data.track;
      } else {
        console.error('❌ Unknown response format:', response.data);
        throw new Error('Backend response formatı tanınamadı');
      }

      console.log('📦 Parsed backend data:', backendData);

      const spotifyId = backendData.trackId || backendData.id;
      const trackName = backendData.title || backendData.name;
      const artistName = backendData.artistNames || backendData.artist || backendData.artistName;

      if (!spotifyId || !trackName || !artistName) {
        console.error('❌ Invalid backend data:', { spotifyId, trackName, artistName, backendData });
        throw new Error('Geçersiz Spotify verisi - eksik alanlar');
      }

      setSongData({
        spotifyId: spotifyId,
        trackName: trackName,
        artistName: artistName,
        coverImage: backendData.imageUrl || backendData.coverImage || backendData.image,
        duration: backendData.duration || backendData.duration_ms,
        previewUrl: backendData.previewUrl || backendData.preview_url,
        spotifyUrl: backendData.spotifyUrl || backendData.external_urls?.spotify
      });

      console.log('✅ Song data set successfully');
    } catch (err) {
      console.error('❌ Spotify metadata error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Şarkı bilgileri alınamadı';
      setError(errorMessage);
      setSongData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleSave = async () => {
    if (!spotifyLink) {
      setError('Spotify linki zorunludur');
      return;
    }

    if (!songData) {
      setError('Şarkı bilgileri yüklenemedi');
      return;
    }

    if (selectedGenres.length === 0) {
      setError('En az bir tür seçmelisiniz');
      return;
    }

    const genreMap = {
      'Afro House': 'afrohouse',
      'Indie Dance': 'indiedance',
      'Organic House': 'organichouse',
      'Down Tempo': 'downtempo',
      'Melodic House': 'melodichouse'
    };

    const musicData = {
      title: songData.trackName,
      artists: songData.artistName,
      imageUrl: songData.coverImage,
      genre: genreMap[selectedGenres[0]],
      platformLinks: {
        spotify: spotifyLink,
        appleMusic: appleMusicLink || undefined
      }
    };

    console.log('Saving music with data:', musicData);
    await onSave(musicData);
  };

  const handleClose = () => {
    setSpotifyLink('');
    setAppleMusicLink('');
    setSelectedGenres([]);
    setSongData(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-music-overlay" onClick={handleClose}>
      <div className="add-music-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-music-header">
          <button className="close-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2 className="modal-title">Şarkı Ekle</h2>
          <button className="save-btn" onClick={handleSave}>
            Kaydet
          </button>
        </div>

        {/* Content */}
        <div className="add-music-content">
          {/* Spotify Link Section */}
          <div className="form-field">
            <div className="field-header">
              <span className="field-icon spotify">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </span>
              <span className="field-label">Spotify Link</span>
              <span className="required-badge">Zorunlu</span>
            </div>
            <p className="field-hint">Spotify linkini yapıştırın, sanatçı ve şarkı adı otomatik gelecek</p>

            <div className="input-with-icon">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </span>
              <input
                type="text"
                className="text-input"
                placeholder="https://open.spotify.com/track/..."
                value={spotifyLink}
                onChange={(e) => handleSpotifyLinkChange(e.target.value)}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Şarkı bilgileri yükleniyor...</p>
            </div>
          )}

          {/* Song Preview - Shows after Spotify link is parsed */}
          {songData && !loading && (
            <div className="song-preview">
              <img
                src={songData.coverImage}
                alt={songData.trackName}
                className="song-cover"
              />
              <div className="song-info">
                <span className="song-title">{songData.trackName}</span>
                <span className="song-artist">{songData.artistName}</span>
              </div>
              <div className="song-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm-2 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-state">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="#fff"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Genre Selection */}
          <div className="form-field">
            <span className="field-label standalone">Tür</span>
            <div className="genre-chips">
              {genres.map((genre) => (
                <button
                  key={genre}
                  className={`genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Other Platform Links Section */}
          <div className="section-divider">
            <span>Diğer Platform Linkleri (Opsiyonel)</span>
          </div>

          {/* Apple Music Link */}
          <div className="form-field">
            <span className="field-label standalone">Apple Music</span>
            <input
              type="text"
              className="text-input"
              placeholder="Apple Music linki"
              value={appleMusicLink}
              onChange={(e) => setAppleMusicLink(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMusicModal;
