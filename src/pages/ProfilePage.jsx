// src/pages/ProfilePage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useChat } from '../context/ChatContext';
import { authAPI, userAPI, playlistAPI } from '../services/api';
import { FiEdit2, FiSettings, FiMessageCircle, FiPlus, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const toast = useToast();
  const { openChatWithUser } = useChat();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('images');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false);
  const additionalImageInputRef = useRef(null);

  // Playlists state
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // Kendi profilim mi kontrol et
  const isOwnProfile = !username || username === currentUser?.username || username === currentUser?._id;

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (activeTab === 'playlists' && user) {
      fetchPlaylists();
    }
  }, [activeTab, user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      if (isOwnProfile) {
        // Kendi profilim - Backend'den güncel veriyi çek (/api/me)
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.user);
          // AuthContext'teki user'ı da güncelle
          updateUser(response.data.user);
        } else {
          setUser(currentUser);
        }
      } else {
        // Başkasının profili - Backend /api/user/:id endpoint'i kullanıyor
        let userData = null;

        // Önce ID olarak dene (MongoDB ID veya başka format olabilir)
        try {
          const response = await userAPI.getUserById(username);
          // Backend farklı response formatları döndürebilir
          if (response.data) {
            userData = response.data.user || response.data;
          }
        } catch (err) {
          console.log('getUserById failed:', err.response?.status, err.message);
        }

        if (userData && userData._id) {
          setUser(userData);
        } else {
          toast.error('Kullanıcı bulunamadı');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      toast.error('Profil yüklenemedi');
      // Hata durumunda en azından currentUser'ı göster
      if (isOwnProfile) {
        setUser(currentUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoadingPlaylists(true);

      if (isOwnProfile) {
        // Kendi playlist'lerim
        const response = await playlistAPI.getMyPlaylists();
        if (response.data.success) {
          setPlaylists(response.data.playlists || []);
        }
      } else {
        // Başkasının playlist'leri
        const response = await playlistAPI.getUserPlaylists(user._id);
        if (response.data.success) {
          setPlaylists(response.data.playlists || []);
        }
      }
    } catch (error) {
      console.error('Playlist yüklenirken hata:', error);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleEditClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('profileImage', file);

      // userAPI kullanarak yükle
      const response = await userAPI.uploadProfileImage(formData);

      // Backend'den sadece profileImage URL'i geliyor
      const newProfileImageUrl = response.data.profileImage;

      if (newProfileImageUrl) {
        // Mevcut user objesini kopyala ve sadece profileImage'ı güncelle
        const updatedUser = {
          ...currentUser,
          profileImage: newProfileImageUrl
        };

        // AuthContext'teki user'ı güncelle
        updateUser(updatedUser);

        // Local state'i güncelle
        setUser(updatedUser);

        toast.success('Profil resmi başarıyla güncellendi');
      } else {
        toast.error('Profil resmi yüklendi ama URL alınamadı');
      }
    } catch (error) {
      console.error('Profil resmi yükleme hatası:', error);
      toast.error(error.response?.data?.message || 'Profil resmi yüklenirken bir hata oluştu');
    } finally {
      setUploadingImage(false);
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAdditionalImageClick = () => {
    if (isOwnProfile) {
      additionalImageInputRef.current?.click();
    }
  };

  const handleAdditionalImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    try {
      setUploadingAdditionalImage(true);

      const formData = new FormData();
      formData.append('additionalImages', file);

      const response = await userAPI.uploadAdditionalImage(formData);

      if (response.data.success) {
        // Backend'den gelen tüm resimler
        const allImages = response.data.additionalImages;

        // Mevcut user objesini kopyala ve additionalImages'ı güncelle
        const updatedUser = {
          ...currentUser,
          additionalImages: allImages
        };

        // AuthContext'teki user'ı güncelle
        updateUser(updatedUser);

        // Local state'i güncelle
        setUser(updatedUser);

        toast.success('Resim başarıyla eklendi');
      } else {
        toast.error('Resim yüklendi ama bir hata oluştu');
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      toast.error(error.response?.data?.message || 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploadingAdditionalImage(false);
      // Input'u temizle
      if (additionalImageInputRef.current) {
        additionalImageInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) return;

    try {
      await userAPI.deleteAdditionalImage(imageId);

      // Mevcut user objesini kopyala ve resmi kaldır
      const updatedUser = {
        ...currentUser,
        additionalImages: (currentUser.additionalImages || []).filter(img => img._id !== imageId)
      };

      // AuthContext'teki user'ı güncelle
      updateUser(updatedUser);

      // Local state'i güncelle
      setUser(updatedUser);

      toast.success('Resim başarıyla silindi');
    } catch (error) {
      console.error('Resim silme hatası:', error);
      toast.error(error.response?.data?.message || 'Resim silinirken bir hata oluştu');
    }
  };

  const tabs = [
    { id: 'images', label: 'Images' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'events', label: 'Events' },
    { id: 'charms', label: 'Charms' }
  ];

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">Kullanıcı bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Back Button */}
      <button className="profile-back-btn" onClick={() => navigate(-1)}>
        <FiChevronLeft size={24} />
      </button>

      {/* Header with Gradient Background */}
      <div className="profile-header">
        <div className="profile-gradient-bg"></div>

        {/* Edit/Settings Button or Message Button */}
        {isOwnProfile ? (
          <>
            <button
              className="profile-edit-btn"
              onClick={handleEditClick}
              disabled={uploadingImage}
            >
              <FiEdit2 size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </>
        ) : (
          <button
            className="profile-message-btn-minimal"
            onClick={() => openChatWithUser({
              _id: user._id,
              username: user.username,
              profileImage: user.profileImage
            })}
          >
            <FiMessageCircle size={14} />
            <span>Mesaj Gönder</span>
          </button>
        )}

        {/* Profile Avatar */}
        <div className="profile-avatar-wrapper">
          {uploadingImage && (
            <div className="profile-avatar-uploading">
              <div className="uploading-spinner"></div>
            </div>
          )}
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.username} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="profile-info">
          <small>Profil</small>
          <h1 className="profile-name">{user.fullName || user.username}</h1>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{user.followerCount || 0}</span>
              <span className="profile-stat-label">Takipçi</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{user.followingCount || 0}</span>
              <span className="profile-stat-label">Takip Edilen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'images' && (
          <div className="profile-images-grid">
            {/* Add Image Button - Only for own profile */}
            {isOwnProfile && (
              <>
                <div
                  className="profile-image-card profile-add-image-card"
                  onClick={handleAdditionalImageClick}
                  style={{ cursor: uploadingAdditionalImage ? 'not-allowed' : 'pointer' }}
                >
                  {uploadingAdditionalImage ? (
                    <div className="uploading-spinner"></div>
                  ) : (
                    <>
                      <FiPlus size={40} />
                      <span>Resim Ekle</span>
                    </>
                  )}
                </div>
                <input
                  ref={additionalImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAdditionalImageUpload}
                  style={{ display: 'none' }}
                />
              </>
            )}

            {/* Existing Images */}
            {user.additionalImages && user.additionalImages.length > 0 ? (
              user.additionalImages
                .filter(img => img && img.url)
                .map((img, index) => (
                  <div key={img._id || index} className="profile-image-card">
                    <img src={img.url} alt={`Image ${index + 1}`} />
                    {isOwnProfile && (
                      <button
                        className="profile-image-delete-btn"
                        onClick={() => handleDeleteImage(img._id)}
                        title="Resmi Sil"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
            ) : !isOwnProfile ? (
              <div className="profile-empty-state">
                <p>Henüz görsel yok</p>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="profile-playlists-grid">
            {loadingPlaylists ? (
              <div className="profile-empty-state">
                <p>Playlist'ler yükleniyor...</p>
              </div>
            ) : playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="profile-playlist-card"
                  onClick={() => navigate(`/my-playlist/${playlist._id}`)}
                >
                  <div className="profile-playlist-cover">
                    {playlist.coverImage ? (
                      <img src={playlist.coverImage} alt={playlist.name} />
                    ) : (
                      <div className="profile-playlist-placeholder">🎵</div>
                    )}
                  </div>
                  <div className="profile-playlist-info">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.trackCount || 0} şarkı</p>
                    {playlist.description && <p className="profile-playlist-desc">{playlist.description}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="profile-empty-state">
                <p>Henüz playlist yok</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="profile-events-list">
            {user.events && user.events.length > 0 ? (
              user.events.map((event, index) => (
                <div key={index} className="profile-event-card">
                  <div className="profile-event-date">{new Date(event.date).toLocaleDateString()}</div>
                  <div className="profile-event-info">
                    <h3>{event.venue}</h3>
                    <p>{event.city}</p>
                    {event.time && <p>{event.time}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="profile-empty-state">
                <p>Henüz etkinlik yok</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charms' && (
          <div className="profile-charms-grid">
            <div className="profile-empty-state">
              <p>Henüz rozet yok</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
