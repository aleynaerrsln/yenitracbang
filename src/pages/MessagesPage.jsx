// src/pages/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import './MessagesPage.css';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { socket, connected, isUserOnline, unreadCount } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    // Yeni mesaj geldiğinde
    const handleNewMessage = (data) => {
      if (data?.message) {
        updateConversationWithNewMessage(data.message);
      }
    };

    socket.on('message:receive', handleNewMessage);

    return () => {
      socket.off('message:receive', handleNewMessage);
    };
  }, [socket, connected]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.conversations || []);
      }
    } catch (error) {
      console.error('Konuşmalar yüklenemedi:', error);
      toast.error('Konuşmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      // Mevcut konuşmayı bul
      const existingIndex = prev.findIndex(
        conv => conv.otherUser._id === message.senderId._id || conv.otherUser._id === message.recipientId._id
      );

      if (existingIndex !== -1) {
        // Mevcut konuşmayı güncelle
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message,
          unreadCount: updated[existingIndex].otherUser._id === message.senderId._id
            ? updated[existingIndex].unreadCount + 1
            : updated[existingIndex].unreadCount
        };
        // En üste taşı
        const [conversation] = updated.splice(existingIndex, 1);
        return [conversation, ...updated];
      } else {
        // Yeni konuşma ekle
        const newConversation = {
          _id: message.senderId._id,
          otherUser: message.senderId,
          lastMessage: message,
          unreadCount: 1
        };
        return [newConversation, ...prev];
      }
    });
  };

  const handleConversationClick = (conversation) => {
    navigate(`/messages/${conversation.otherUser._id}`);
  };

  const getProfileImage = (user) => {
    if (user.profileImage && user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    return '/assets/default-profile.png';
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const username = conv.otherUser.username?.toLowerCase() || '';
    const firstName = conv.otherUser.firstName?.toLowerCase() || '';
    const lastName = conv.otherUser.lastName?.toLowerCase() || '';
    const lastMessage = conv.lastMessage?.message?.toLowerCase() || '';

    return username.includes(query) ||
           firstName.includes(query) ||
           lastName.includes(query) ||
           lastMessage.includes(query);
  });

  if (loading) {
    return (
      <div className="messages-page">
        <div className="messages-container">
          <div className="messages-header">
            <h1>Mesajlar</h1>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Header */}
        <div className="messages-header">
          <h1>Mesajlar</h1>
          {!connected && (
            <span className="connection-status offline">Bağlantı yok</span>
          )}
        </div>

        {/* Search */}
        <div className="messages-search">
          <input
            type="text"
            placeholder="Konuşmalarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>{searchQuery ? 'Konuşma bulunamadı' : 'Henüz mesajınız yok'}</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className="conversation-item"
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="conversation-avatar">
                  <img
                    src={getProfileImage(conversation.otherUser)}
                    alt={conversation.otherUser.username}
                  />
                  {isUserOnline(conversation.otherUser._id) && (
                    <span className="online-indicator"></span>
                  )}
                </div>

                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3 className="conversation-name">
                      {conversation.otherUser.firstName && conversation.otherUser.lastName
                        ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
                        : `@${conversation.otherUser.username}`}
                    </h3>
                    <span className="conversation-time">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>

                  <div className="conversation-last-message">
                    <p className={conversation.unreadCount > 0 ? 'unread' : ''}>
                      {conversation.lastMessage.message}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
