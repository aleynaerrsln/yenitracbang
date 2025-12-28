// src/pages/ProfilePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiEdit2, FiSettings } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('images');

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

        {/* Edit/Settings Button */}
        {isOwnProfile && (
          <button className="profile-edit-btn" onClick={() => navigate('/settings')}>
            <FiEdit2 size={20} />
          </button>
        )}

        {/* Profile Avatar */}
        <div className="profile-avatar-wrapper">
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
          <h1 className="profile-name">{user.fullName || user.username}</h1>
          <p className="profile-username">@{user.username}</p>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{user.followerCount || 0}</span>
              <span className="profile-stat-label">Takipçi</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{user.followingCount || 0}</span>
              <span className="profile-stat-label">Takip</span>
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
