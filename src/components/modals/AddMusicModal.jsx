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
      // Örnek: https://open.spotify.com/intl-tr/track/0bvgWq2ZUhwwjLR1...
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
      console.log('✅ Response structure:', {
        data: response.data,
        success: response.data?.success,
        hasData: !!response.data?.data
      });

      // Backend response'u parse et
      let backendData;

      // Format 1: { success: true, data: {...} }
      if (response.data?.success && response.data?.data) {
        backendData = response.data.data;
      }
      // Format 2: Direkt data dönüyor
      else if (response.data?.id && response.data?.name) {
        backendData = response.data;
      }
      // Format 3: Nested data
      else if (response.data?.track) {
        backendData = response.data.track;
      }
      else {
        console.error('❌ Unknown response format:', response.data);
        throw new Error('Backend response formatı tanınamadı');
      }

      console.log('📦 Parsed backend data:', backendData);

      // Track ID ve title'ı normalize et (backend farklı field isimleri kullanıyor)
      const spotifyId = backendData.trackId || backendData.id;
      const trackName = backendData.title || backendData.name;
      const artistName = backendData.artistNames || backendData.artist || backendData.artistName;

      // Veri kontrolü
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
      console.error('❌ Error details:', err.response?.data);

      // Backend'den gelen hata mesajını kullan
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

    // Backend formatına çevir
    const genreMap = {
      'Afro House': 'afrohouse',
      'Indie Dance': 'indiedance',
      'Organic House': 'organichouse',
      'Down Tempo': 'downtempo',
      'Melodic House': 'melodichouse'
    };

    const musicData = {
      title: songData.trackName,
      artists: songData.artistName, // Backend string veya array kabul ediyor
      imageUrl: songData.coverImage,
      genre: genreMap[selectedGenres[0]], // Backend tek genre istiyor
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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="add-music-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <button className="close-modal-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2 className="modal-title">Şarkı Ekle</h2>
          <button className="save-btn-header" onClick={handleSave}>
            Kaydet
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Spotify Link */}
          <div className="form-section">
            <label className="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify Link
              <span className="required">Zorunlu</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="https://open.spotify.com/track/..."
              value={spotifyLink}
              onChange={(e) => handleSpotifyLinkChange(e.target.value)}
            />
            <p className="form-hint">Spotify linkini yapıştırın, sanatçı ve şarkı adı otomatik gelecek</p>
          </div>

          {/* Song Preview */}
          {loading && (
            <div className="song-preview loading">
              <div className="loading-spinner"></div>
              <p>Şarkı bilgileri yükleniyor...</p>
            </div>
          )}

          {/* Sanatçı Adı */}
          {songData && (
            <div className="form-section">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Sanatçı Adı
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954" style={{ marginLeft: '8px' }}>
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              </label>
              <input
                type="text"
                className="form-input readonly"
                value={songData.artistName}
                readOnly
                disabled
              />
            </div>
          )}

          {/* Şarkı Adı */}
          {songData && (
            <div className="form-section">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                Şarkı Adı
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954" style={{ marginLeft: '8px' }}>
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              </label>
              <input
                type="text"
                className="form-input readonly"
                value={songData.trackName}
                readOnly
                disabled
              />
            </div>
          )}

          {/* Kapak Resmi */}
          {songData && (
            <div className="form-section">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify Kapak Resmi
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954" style={{ marginLeft: '8px' }}>
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              </label>
              <div className="cover-image-preview">
                <img src={songData.coverImage} alt={songData.trackName} />
                <p className="cover-hint">Spotify'dan otomatik alındı</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="#fff"/>
              </svg>
              {error}
            </div>
          )}

          {/* Genre Selection */}
          <div className="form-section">
            <label className="form-label">Tür</label>
            <div className="genre-buttons">
              {genres.map((genre) => (
                <button
                  key={genre}
                  className={`genre-btn ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Apple Music Link (Optional) */}
          <div className="form-section">
            <label className="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FA243C">
                <path d="M23.994 6.124c0-.738-.034-1.47-.098-2.198-.065-.765-.171-1.531-.396-2.269-.25-.871-.663-1.654-1.227-2.315-.565-.666-1.279-1.171-2.081-1.523C19.470-.431 18.683-.64 17.884-.756c-.766-.112-1.538-.167-2.308-.198C14.611-.989 13.645-1 12.696-1c-.949 0-1.915.011-2.88.046-.77.031-1.542.086-2.308.198-.799.116-1.586.325-2.308.576-.802.352-1.516.857-2.081 1.523C2.554.909 2.141 1.692 1.891 2.563c-.225.738-.331 1.504-.396 2.269C1.431 5.6 1.397 6.332 1.397 7.07 1.363 8.014 1.352 8.958 1.352 9.902c0 .944.011 1.888.045 2.832.034.738.068 1.47.098 2.198.065.765.171 1.531.396 2.269.25.871.663 1.654 1.227 2.315.565.666 1.279 1.171 2.081 1.523.722.251 1.509.46 2.308.576.766.112 1.538.167 2.308.198.965.035 1.931.046 2.88.046.949 0 1.915-.011 2.88-.046.77-.031 1.542-.086 2.308-.198.799-.116 1.586-.325 2.308-.576.802-.352 1.516-.857 2.081-1.523.564-.661.977-1.444 1.227-2.315.225-.738.331-1.504.396-2.269.03-.728.064-1.46.098-2.198.034-.944.045-1.888.045-2.832 0-.944-.011-1.888-.045-2.832zm-3.568 9.347c-.033.694-.125 1.383-.3 2.056-.192.722-.478 1.396-.93 1.968-.456.577-1.048.998-1.735 1.232-.684.235-1.402.334-2.122.401-.721.067-1.443.102-2.165.118-.95.022-1.9.034-2.851.034-.951 0-1.901-.012-2.851-.034-.722-.016-1.444-.051-2.165-.118-.72-.067-1.438-.166-2.122-.401-.687-.234-1.279-.655-1.735-1.232-.452-.572-.738-1.246-.93-1.968-.175-.673-.267-1.362-.3-2.056-.036-.721-.053-1.443-.071-2.165-.024-.95-.036-1.9-.036-2.851 0-.951.012-1.901.036-2.851.018-.722.035-1.444.071-2.165.033-.694.125-1.383.3-2.056.192-.722.478-1.396.93-1.968.456-.577 1.048-.998 1.735-1.232.684-.235 1.402-.334 2.122-.401.721-.067 1.443-.102 2.165-.118.95-.022 1.9-.034 2.851-.034.951 0 1.901.012 2.851.034.722.016 1.444.051 2.165.118.72.067 1.438.166 2.122.401.687.234 1.279.655 1.735 1.232.452.572.738 1.246.93 1.968.175.673.267 1.362.3 2.056.036.721.053 1.443.071 2.165.024.95.036 1.9.036 2.851 0 .951-.012 1.901-.036 2.851-.018.722-.035 1.444-.071 2.165zm-7.945-4.378c-.011-.906-.227-1.793-.648-2.588-.419-.793-1.022-1.476-1.755-1.986-.732-.508-1.579-.83-2.465-.933-.884-.102-1.779-.032-2.646.205-.866.236-1.684.65-2.373 1.24-.689.589-1.229 1.337-1.567 2.182-.337.844-.471 1.764-.389 2.678.083.914.368 1.801.831 2.577.463.776 1.097 1.421 1.846 1.878.748.457 1.592.712 2.46.743.867.031 1.738-.129 2.54-.467.802-.338 1.515-.859 2.08-1.517.564-.658.964-1.435 1.165-2.268.201-.833.227-1.698.095-2.534l-.174-.21z"/>
              </svg>
              Apple Music Linki
              <span className="optional">(Opsiyonel)</span>
            </label>
            <input
              type="text"
              className="form-input apple-music"
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
