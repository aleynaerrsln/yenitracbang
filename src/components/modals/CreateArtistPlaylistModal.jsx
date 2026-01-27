// src/components/modals/CreateArtistPlaylistModal.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { artistEssentialAPI } from '../../services/api';
import { FiX, FiImage, FiMusic, FiCheck, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import './CreateArtistPlaylistModal.css';

const CreateArtistPlaylistModal = ({ isOpen, onClose, onSuccess, editPlaylist = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [selectedMusicIds, setSelectedMusicIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Music selection state
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [allMusic, setAllMusic] = useState([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit modunda populate edilmiş şarkı verileri için
  const [editMusicData, setEditMusicData] = useState([]);

  const fileInputRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Modal açıldığında şarkıları yükle (seçilen şarkıları göstermek için)
      loadAllMusic();

      if (editPlaylist) {
        setName(editPlaylist.name || '');
        setDescription(editPlaylist.description || '');
        setCoverPreview(editPlaylist.coverImage || null);

        // Musics populate edilmiş mi kontrol et
        if (editPlaylist.musics?.length > 0) {
          if (typeof editPlaylist.musics[0] === 'object' && editPlaylist.musics[0]._id) {
            // Populate edilmiş - object array
            setEditMusicData(editPlaylist.musics);
            setSelectedMusicIds(editPlaylist.musics.map(m => m._id));
            console.log('Edit playlist musics (populated):', editPlaylist.musics);
          } else {
            // Sadece ID'ler
            setSelectedMusicIds(editPlaylist.musics);
            console.log('Edit playlist musics (IDs only):', editPlaylist.musics);
          }
        } else {
          setSelectedMusicIds([]);
          setEditMusicData([]);
        }
      } else {
        resetForm();
        setEditMusicData([]);
      }
    }
  }, [isOpen, editPlaylist]);

  // Şarkıları yükle (async wrapper)
  const loadAllMusic = async () => {
    if (allMusic.length === 0) {
      await fetchAllMusic();
    }
  };

  // Fetch music when music selector opens
  useEffect(() => {
    if (showMusicSelector && allMusic.length === 0) {
      fetchAllMusic();
    }
  }, [showMusicSelector]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCoverImage(null);
    setCoverPreview(null);
    setSelectedMusicIds([]);
    setEditMusicData([]);
    setError('');
    setSearchQuery('');
  };

  const fetchAllMusic = async () => {
    try {
      setMusicLoading(true);
      const response = await artistEssentialAPI.getAllMusicForPlaylist(searchQuery);
      const musics = response.data?.data?.musics || response.data?.musics || [];
      setAllMusic(musics);
    } catch (err) {
      console.error('Failed to fetch music:', err);
    } finally {
      setMusicLoading(false);
    }
  };

  const handleSearchMusic = async () => {
    await fetchAllMusic();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleMusic = (musicId) => {
    setSelectedMusicIds(prev => {
      if (prev.includes(musicId)) {
        return prev.filter(id => id !== musicId);
      } else {
        return [...prev, musicId];
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Playlist adı zorunludur');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // JSON request gönder (FormData yerine) - Backend base64 image destekliyor
      // Bu şekilde musicIds array olarak düzgün gider
      const requestData = {
        name: name.trim(),
        description: description.trim(),
        musicIds: selectedMusicIds
      };

      console.log('Saving playlist with musicIds:', selectedMusicIds);

      // Cover image varsa base64 olarak ekle
      if (coverPreview && typeof coverPreview === 'string' && coverPreview.startsWith('data:')) {
        requestData.coverImage = coverPreview;
      }

      let response;
      if (editPlaylist) {
        response = await artistEssentialAPI.updatePlaylist(editPlaylist._id, requestData);
      } else {
        response = await artistEssentialAPI.createPlaylist(requestData);
      }

      console.log('Playlist saved:', response.data);

      if (onSuccess) {
        onSuccess(response.data?.data?.playlist || response.data?.playlist);
      }

      handleClose();
    } catch (err) {
      console.error('Failed to save playlist:', err);
      setError(err.response?.data?.message || 'Playlist kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setShowMusicSelector(false);
    setEditMusicData([]);
    onClose();
  };

  // Filter music based on search
  const filteredMusic = allMusic.filter(music => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      music.title?.toLowerCase().includes(query) ||
      music.artistNames?.toLowerCase().includes(query) ||
      music.artist?.toLowerCase().includes(query)
    );
  });

  // Get selected music details - hem allMusic hem editMusicData'dan
  const selectedMusic = useMemo(() => {
    const musicMap = new Map();

    // Önce editMusicData'dan ekle (edit modunda populate edilmiş veriler)
    editMusicData.forEach(m => {
      if (selectedMusicIds.includes(m._id)) {
        musicMap.set(m._id, m);
      }
    });

    // Sonra allMusic'ten ekle (üzerine yazar, daha güncel veri)
    allMusic.forEach(m => {
      if (selectedMusicIds.includes(m._id)) {
        musicMap.set(m._id, m);
      }
    });

    // Sıralamayı koru
    return selectedMusicIds
      .map(id => musicMap.get(id))
      .filter(Boolean);
  }, [allMusic, editMusicData, selectedMusicIds]);

  if (!isOpen) return null;

  return (
    <div className="create-playlist-overlay" onClick={handleClose}>
      <div className="create-playlist-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="create-playlist-header">
          <button className="close-btn" onClick={handleClose}>
            <FiX size={20} />
          </button>
          <h2 className="modal-title">
            {editPlaylist ? 'Playlist Düzenle' : 'DJ Chart Oluştur'}
          </h2>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '...' : 'Kaydet'}
          </button>
        </div>

        {/* Content */}
        <div className="create-playlist-content">
          {/* Cover Image Section */}
          <div className="cover-section">
            <div
              className="cover-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="cover-preview" />
                  <button
                    className="remove-cover-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCover();
                    }}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </>
              ) : (
                <div className="cover-placeholder">
                  <FiImage size={32} />
                  <span>Kapak Ekle</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Name Input */}
          <div className="form-field">
            <label className="field-label">Playlist Adı</label>
            <input
              type="text"
              className="text-input"
              placeholder="Playlist adını girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description Input */}
          <div className="form-field">
            <label className="field-label">Açıklama</label>
            <textarea
              className="text-input textarea"
              placeholder="Playlist açıklaması (opsiyonel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          {/* Selected Music Section */}
          <div className="selected-music-section">
            <div className="section-header">
              <span className="section-title">
                <FiMusic size={16} />
                Seçilen Şarkılar ({selectedMusicIds.length})
              </span>
              <button
                className="add-music-btn"
                onClick={() => setShowMusicSelector(true)}
              >
                <FiPlus size={16} />
                Şarkı Ekle
              </button>
            </div>

            {selectedMusic.length > 0 ? (
              <div className="selected-music-list">
                {selectedMusic.map((music) => (
                  <div key={music._id} className="selected-music-item">
                    <img
                      src={music.imageUrl}
                      alt={music.title}
                      className="music-thumb"
                    />
                    <div className="music-info">
                      <span className="music-title">{music.title}</span>
                      <span className="music-artist">{music.artistNames || music.artist}</span>
                    </div>
                    <button
                      className="remove-music-btn"
                      onClick={() => handleToggleMusic(music._id)}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-music-message">
                <FiMusic size={24} />
                <span>Henüz şarkı eklenmedi</span>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="info-box">
            <span className="info-icon">ℹ️</span>
            <span className="info-text">
              DJ Chart'ınız admin onayından sonra herkes tarafından görülebilir olacaktır.
            </span>
          </div>
        </div>

        {/* Music Selector Modal */}
        {showMusicSelector && (
          <div className="music-selector-overlay" onClick={() => setShowMusicSelector(false)}>
            <div className="music-selector-modal" onClick={(e) => e.stopPropagation()}>
              <div className="music-selector-header">
                <button className="back-btn" onClick={() => setShowMusicSelector(false)}>
                  <FiX size={20} />
                </button>
                <h3>Şarkı Seç</h3>
                <button
                  className="done-btn"
                  onClick={() => setShowMusicSelector(false)}
                >
                  Tamam ({selectedMusicIds.length})
                </button>
              </div>

              {/* Search */}
              <div className="music-search">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Şarkı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchMusic()}
                />
              </div>

              {/* Music List */}
              <div className="music-list">
                {musicLoading ? (
                  <div className="music-loading">
                    <div className="spinner"></div>
                    <span>Yükleniyor...</span>
                  </div>
                ) : filteredMusic.length === 0 ? (
                  <div className="music-empty">
                    <FiMusic size={32} />
                    <span>Şarkı bulunamadı</span>
                  </div>
                ) : (
                  filteredMusic.map((music) => (
                    <div
                      key={music._id}
                      className={`music-item ${selectedMusicIds.includes(music._id) ? 'selected' : ''}`}
                      onClick={() => handleToggleMusic(music._id)}
                    >
                      <img
                        src={music.imageUrl}
                        alt={music.title}
                        className="music-thumb"
                      />
                      <div className="music-info">
                        <span className="music-title">{music.title}</span>
                        <span className="music-artist">
                          {music.artistNames || music.artist}
                          {music.isMine && <span className="my-music-badge">Benim</span>}
                        </span>
                      </div>
                      <div className="music-check">
                        {selectedMusicIds.includes(music._id) ? (
                          <FiCheck size={20} />
                        ) : (
                          <FiPlus size={20} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateArtistPlaylistModal;
