// src/pages/ProfilePage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import { FiEdit2, FiSettings, FiMessageCircle } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('images');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Kendi profilim mi kontrol et
  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      if (isOwnProfile) {
        // Kendi profilim - /api/auth/me
        setUser(currentUser);
      } else {
        // Başkasının profili - /api/users/:username
        // TODO: Backend'e username ile kullanıcı getirme endpoint'i eklenecek
        toast.error('Kullanıcı profili henüz desteklenmiyor');
        navigate('/');
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      toast.error('Profil yüklenemedi');
    } finally {
      setLoading(false);
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
            className="profile-message-btn"
            onClick={() => navigate(`/messages/${user._id}`)}
          >
            <FiMessageCircle size={20} />
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
            {user.additionalImages && user.additionalImages.length > 0 ? (
              user.additionalImages.map((img, index) => (
                <div key={index} className="profile-image-card">
                  <img src={img.url} alt={`Image ${index + 1}`} />
                </div>
              ))
            ) : (
              <div className="profile-empty-state">
                <p>Henüz görsel yok</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="profile-playlists-grid">
            <div className="profile-empty-state">
              <p>Playlist'ler yükleniyor...</p>
            </div>
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
