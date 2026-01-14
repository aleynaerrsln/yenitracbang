// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiMusic, FiHeart, FiUserPlus, FiList, FiStar, FiBell } from 'react-icons/fi';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, music, like, follow, playlist

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getUserNotifications({
        page: 1,
        limit: 50
      });

      console.log('Notifications response:', response.data);

      // Backend'den gelen notifications array'ini al
      const notifs = response.data.data?.notifications || response.data.notifications || [];
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Bildirimler yüklenemedi');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'music':
      case 'new_music':
        return <FiMusic size={20} />;
      case 'like':
        return <FiHeart size={20} />;
      case 'follow':
        return <FiUserPlus size={20} />;
      case 'playlist':
      case 'playlist_feature':
        return <FiList size={20} />;
      case 'top_chart':
        return <FiStar size={20} />;
      default:
        return <FiBell size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'music':
      case 'new_music':
        return '#1DB954'; // Spotify green
      case 'like':
        return '#FF6B6B'; // Red
      case 'follow':
        return '#4A90E2'; // Blue
      case 'playlist':
      case 'playlist_feature':
        return '#9B59B6'; // Purple
      case 'top_chart':
        return '#F39C12'; // Gold
      default:
        return '#95A5A6'; // Gray
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return notifDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleNotificationClick = (notification) => {
    // Deep link varsa oraya yönlendir
    if (notification.deepLink) {
      console.log('Deep link:', notification.deepLink);
      // TODO: Deep link navigation implementation
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;

    // Filtre kategorilerine göre type'ları grupla
    switch (filter) {
      case 'music':
        return notif.type === 'music' || notif.type === 'new_music';
      case 'like':
        return notif.type === 'like';
      case 'follow':
        return notif.type === 'follow';
      case 'playlist':
        return notif.type === 'playlist' || notif.type === 'playlist_feature' || notif.type === 'top_chart';
      default:
        return notif.type === filter;
    }
  });

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-header">
          <h1>Bildirimler</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Bildirimler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <h1>Bildirimler</h1>
        <div className="notification-count">
          {notifications.length}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notification-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <FiBell size={16} />
          Tümü
        </button>
        <button
          className={`filter-btn ${filter === 'music' ? 'active' : ''}`}
          onClick={() => setFilter('music')}
        >
          <FiMusic size={16} />
          Müzik
        </button>
        <button
          className={`filter-btn ${filter === 'like' ? 'active' : ''}`}
          onClick={() => setFilter('like')}
        >
          <FiHeart size={16} />
          Beğeni
        </button>
        <button
          className={`filter-btn ${filter === 'follow' ? 'active' : ''}`}
          onClick={() => setFilter('follow')}
        >
          <FiUserPlus size={16} />
          Takip
        </button>
        <button
          className={`filter-btn ${filter === 'playlist' ? 'active' : ''}`}
          onClick={() => setFilter('playlist')}
        >
          <FiList size={16} />
          Playlist
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiBell size={60} />
            </div>
            <h3>Bildirim yok</h3>
            <p>
              {filter === 'all'
                ? 'Henüz hiç bildiriminiz yok'
                : `${filter} kategorisinde bildirim yok`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className="notification-item"
              onClick={() => handleNotificationClick(notification)}
            >
              <div
                className="notification-icon"
                style={{ backgroundColor: getNotificationColor(notification.type) }}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-body">{notification.body}</div>
                <div className="notification-time">
                  {formatTimeAgo(notification.createdAt)}
                </div>
              </div>

              {notification.imageUrl && (
                <div className="notification-image">
                  <img src={notification.imageUrl} alt="Notification" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
