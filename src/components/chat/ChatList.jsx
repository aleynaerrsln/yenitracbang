// src/components/chat/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { messageAPI, searchAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FiMessageCircle, FiX, FiMinus, FiEdit3, FiSearch, FiArrowLeft } from 'react-icons/fi';
import './ChatList.css';

const ChatList = ({ onSelectConversation, onClose }) => {
  const { socket, connected, isUserOnline, unreadCount, markConversationAsRead } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (data) => {
      if (data?.message) {
        updateConversationWithNewMessage(data.message);
      }
    };

    socket.on('message:receive', handleNewMessage);
    return () => socket.off('message:receive', handleNewMessage);
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
    } finally {
      setLoading(false);
    }
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.otherUser._id === message.senderId._id || conv.otherUser._id === message.recipientId._id
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message,
          unreadCount: updated[existingIndex].otherUser._id === message.senderId._id
            ? updated[existingIndex].unreadCount + 1
            : updated[existingIndex].unreadCount
        };
        const [conversation] = updated.splice(existingIndex, 1);
        return [conversation, ...updated];
      }

      const newConversation = {
        _id: message.senderId._id,
        otherUser: message.senderId,
        lastMessage: message,
        unreadCount: 1
      };
      return [newConversation, ...prev];
    });
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

  // Kullanıcı ara
  const handleSearchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await searchAPI.searchUsers(query);
      if (response.data.success) {
        // Backend response: { success, users: [...] }
        const users = response.data.users || [];
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Arama debounce
  useEffect(() => {
    if (showNewMessage && searchQuery.trim()) {
      const debounce = setTimeout(() => {
        handleSearchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, showNewMessage]);

  const handleSelectUser = (user) => {
    onSelectConversation(user);
    setShowNewMessage(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectConversation = (conversation) => {
    // Okunmamış mesajları okundu olarak işaretle
    if (conversation.unreadCount > 0) {
      markConversationAsRead(conversation.otherUser._id);
      // Local state'i güncelle
      setConversations(prev => prev.map(conv =>
        conv.otherUser._id === conversation.otherUser._id
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    }
    onSelectConversation(conversation.otherUser);
  };

  if (isMinimized) {
    return (
      <div className="chat-list minimized" onClick={() => setIsMinimized(false)}>
        <div className="chat-list-minimized-header">
          <FiMessageCircle size={20} />
          <span>Mesajlar</span>
          {unreadCount > 0 && <span className="chat-list-badge">{unreadCount}</span>}
          <button className="minimized-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <FiX size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        {showNewMessage ? (
          <>
            <button onClick={() => { setShowNewMessage(false); setSearchQuery(''); }} className="chat-list-back-btn">
              <FiArrowLeft size={20} />
            </button>
            <h3>Yeni Mesaj</h3>
          </>
        ) : (
          <>
            <h3>Mesajlar</h3>
            <button onClick={() => setShowNewMessage(true)} className="chat-list-new-btn" title="Yeni Mesaj">
              <FiEdit3 size={18} />
            </button>
          </>
        )}
        <div className="chat-list-actions">
          <button onClick={() => setIsMinimized(true)} className="chat-list-btn">
            <FiMinus size={18} />
          </button>
          <button onClick={onClose} className="chat-list-btn">
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Yeni Mesaj Modu - Arama */}
      {showNewMessage && (
        <div className="chat-list-search">
          <div className="search-input-wrapper">
            <FiSearch size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      <div className="chat-list-content">
        {showNewMessage ? (
          // Yeni Mesaj - Kullanıcı Arama Sonuçları
          searching ? (
            <div className="chat-list-loading">
              <div className="spinner-small"></div>
              <p>Aranıyor...</p>
            </div>
          ) : searchQuery.trim() === '' ? (
            <div className="chat-list-empty">
              <FiSearch size={40} />
              <p>Kullanıcı ara</p>
              <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>Mesaj göndermek için bir kullanıcı ara</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="chat-list-empty">
              <FiSearch size={40} />
              <p>Kullanıcı bulunamadı</p>
            </div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user._id}
                className="chat-list-item"
                onClick={() => handleSelectUser(user)}
              >
                <div className="chat-list-avatar">
                  <img src={getProfileImage(user)} alt={user.username} />
                  {isUserOnline(user._id) && <span className="online-dot-list"></span>}
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <h4>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : `@${user.username}`}
                    </h4>
                  </div>
                  <div className="chat-list-bottom">
                    <p style={{ opacity: 0.6 }}>@{user.username}</p>
                  </div>
                </div>
              </div>
            ))
          )
        ) : loading ? (
          <div className="chat-list-loading">
            <div className="spinner-small"></div>
            <p>Yükleniyor...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="chat-list-empty">
            <FiMessageCircle size={40} />
            <p>Henüz mesajınız yok</p>
            <span style={{ fontSize: '0.8125rem', opacity: 0.7, marginTop: '0.5rem' }}>
              Yeni mesaj göndermek için yukarıdaki ✏️ butonuna tıklayın
            </span>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id}
              className="chat-list-item"
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="chat-list-avatar">
                <img src={getProfileImage(conversation.otherUser)} alt={conversation.otherUser.username} />
                {isUserOnline(conversation.otherUser._id) && <span className="online-dot-list"></span>}
              </div>
              <div className="chat-list-info">
                <div className="chat-list-top">
                  <h4>
                    {conversation.otherUser.firstName && conversation.otherUser.lastName
                      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
                      : `@${conversation.otherUser.username}`}
                  </h4>
                  <span className="chat-list-time">{formatTime(conversation.lastMessage.createdAt)}</span>
                </div>
                <div className="chat-list-bottom">
                  <p className={conversation.unreadCount > 0 ? 'unread' : ''}>
                    {conversation.lastMessage.message}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="chat-list-unread">{conversation.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
