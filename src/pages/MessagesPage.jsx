// src/pages/MessagesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FiArrowLeft, FiSend, FiEdit, FiX } from 'react-icons/fi';
import './MessagesPage.css';

const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Panel'i kapatma fonksiyonu
  const closePanel = () => {
    navigate(-1); // Önceki sayfaya dön
  };
  const { user } = useAuth();
  const { socket, connected, sendMessage: socketSendMessage, markConversationAsRead, startTyping, stopTyping, isUserOnline } = useSocket();

  // Conversation list state
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active chat state
  const [selectedUserId, setSelectedUserId] = useState(userId || null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // URL'deki userId değişirse selectedUserId'yi güncelle
  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  // Konuşmaları yükle
  useEffect(() => {
    fetchConversations();
  }, []);

  // Seçili kullanıcı değişince mesajları yükle
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages();
    }
  }, [selectedUserId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    // Yeni mesaj geldiğinde
    const handleNewMessage = (data) => {
      if (data?.message) {
        // Konuşma listesini güncelle
        updateConversationWithNewMessage(data.message);

        // Aktif sohbetteyse mesajları güncelle
        if (selectedUserId && data.message.senderId._id === selectedUserId) {
          setMessages(prev => [...prev, data.message]);
          scrollToBottom();
          markConversationAsRead(selectedUserId);
        }
      }
    };

    // Typing events
    const handleTypingStart = (data) => {
      if (data?.userId === selectedUserId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data?.userId === selectedUserId) {
        setIsTyping(false);
      }
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, connected, selectedUserId]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await messageAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.conversations || []);
      }
    } catch (error) {
      console.error('Konuşmalar yüklenemedi:', error);
      toast.error('Konuşmalar yüklenemedi');
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUserId) return;

    try {
      setLoadingMessages(true);
      const response = await messageAPI.getConversation(selectedUserId, { page: 1, limit: 50 });

      if (response.data.success) {
        const fetchedMessages = response.data.messages || [];
        setMessages(fetchedMessages);

        // Karşı kullanıcı bilgisini al
        if (fetchedMessages.length > 0) {
          const firstMessage = fetchedMessages[0];
          const other = firstMessage.senderId._id === user._id
            ? firstMessage.recipientId
            : firstMessage.senderId;
          setOtherUser(other);
        } else {
          // Konuşma listesinden bul
          const conv = conversations.find(c => c.otherUser._id === selectedUserId);
          if (conv) {
            setOtherUser(conv.otherUser);
          }
        }

        // Mesajları okundu olarak işaretle
        markConversationAsRead(selectedUserId);

        // Scroll to bottom
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setLoadingMessages(false);
    }
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.otherUser._id === message.senderId._id || conv.otherUser._id === message.recipientId._id
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        const isFromOther = updated[existingIndex].otherUser._id === message.senderId._id;
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message,
          unreadCount: isFromOther && selectedUserId !== message.senderId._id
            ? updated[existingIndex].unreadCount + 1
            : updated[existingIndex].unreadCount
        };
        const [conversation] = updated.splice(existingIndex, 1);
        return [conversation, ...updated];
      } else {
        const newConversation = {
          _id: message.senderId._id,
          otherUser: message.senderId,
          lastMessage: message,
          unreadCount: selectedUserId !== message.senderId._id ? 1 : 0
        };
        return [newConversation, ...prev];
      }
    });
  };

  const handleConversationClick = (conversation) => {
    setSelectedUserId(conversation.otherUser._id);
    setOtherUser(conversation.otherUser);

    // Unread count'u sıfırla
    setConversations(prev => prev.map(c =>
      c.otherUser._id === conversation.otherUser._id
        ? { ...c, unreadCount: 0 }
        : c
    ));

    // URL'yi güncelle (history'ye eklemeden)
    window.history.replaceState(null, '', `/messages/${conversation.otherUser._id}`);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
    setMessages([]);
    setOtherUser(null);
    window.history.replaceState(null, '', '/messages');
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!messageText.trim() || sending || !selectedUserId) return;

    if (!connected) {
      toast.error('Bağlantı yok. Lütfen tekrar deneyin.');
      return;
    }

    const text = messageText.trim();
    const tempId = `temp_${Date.now()}`;

    // Optimistic update
    const tempMessage = {
      _id: tempId,
      senderId: { _id: user._id, username: user.username, profileImage: user.profileImage },
      recipientId: { _id: selectedUserId },
      message: text,
      createdAt: new Date().toISOString(),
      deliveryStatus: 'sending',
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageText('');
    setSending(true);
    scrollToBottom();

    try {
      const response = await socketSendMessage(selectedUserId, text, tempId);

      // Geçici mesajı gerçek mesajla değiştir
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? response.message : msg
      ));

      // Konuşma listesini güncelle
      updateConversationWithNewMessage(response.message);

      scrollToBottom();
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      toast.error(error.message || 'Mesaj gönderilemedi');
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (!connected || !selectedUserId) return;

    startTyping(selectedUserId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedUserId);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getProfileImage = (u) => {
    if (u?.profileImage && u.profileImage.startsWith('http')) {
      return u.profileImage;
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

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return `Dün ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'dd MMM HH:mm', { locale: tr });
    }
  };

  const formatDateSeparator = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return 'Bugün';
    } else if (isYesterday(messageDate)) {
      return 'Dün';
    } else {
      return format(messageDate, 'dd MMMM yyyy', { locale: tr });
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach(message => {
      const messageDate = format(new Date(message.createdAt), 'yyyy-MM-dd');

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ type: 'date', date: message.createdAt });
      }

      groups.push({ type: 'message', data: message });
    });

    return groups;
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

  const groupedMessages = groupMessagesByDate(messages);

  // Mobilde sohbet açıksa sadece sohbeti göster
  const showChatPanel = selectedUserId !== null;

  return (
    <div className="messages-page">
      <div className={`messages-layout ${showChatPanel ? 'chat-active' : ''}`}>
        {/* Sol Panel - Konuşma Listesi */}
        <div className={`conversations-panel ${showChatPanel ? 'hidden-mobile' : ''}`}>
          {/* Header */}
          <div className="messages-header">
            <h1>Mesajlar</h1>
            <div className="header-actions">
              <button className="new-message-btn">
                <FiEdit size={18} />
              </button>
              <button className="close-panel-btn" onClick={closePanel}>
                <FiX size={20} />
              </button>
            </div>
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
            {loadingConversations ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Yükleniyor...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
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
                  className={`conversation-item ${selectedUserId === conversation.otherUser._id ? 'active' : ''}`}
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

        {/* Sağ Panel - Chat */}
        <div className={`chat-panel ${showChatPanel ? 'active' : ''}`}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button className="back-button" onClick={handleBackToList}>
                  <FiArrowLeft size={24} />
                </button>

                <div className="header-info">
                  <div className="header-avatar">
                    <img src={getProfileImage(otherUser)} alt={otherUser?.username} />
                    {isUserOnline(selectedUserId) && <span className="online-dot"></span>}
                  </div>
                  <div className="header-text">
                    <h2>
                      {otherUser?.firstName && otherUser?.lastName
                        ? `${otherUser.firstName} ${otherUser.lastName}`
                        : `@${otherUser?.username || ''}`}
                    </h2>
                    {isTyping ? (
                      <p className="typing-indicator">yazıyor...</p>
                    ) : isUserOnline(selectedUserId) ? (
                      <p className="status online">Çevrimiçi</p>
                    ) : (
                      <p className="status">Çevrimdışı</p>
                    )}
                  </div>
                </div>

                <button className="close-chat-btn" onClick={handleBackToList}>
                  <FiX size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <>
                    {groupedMessages.map((item, index) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date-${index}`} className="date-separator">
                            <span>{formatDateSeparator(item.date)}</span>
                          </div>
                        );
                      }

                      const message = item.data;
                      const isMine = message.senderId._id === user._id;

                      return (
                        <div
                          key={message._id}
                          className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}
                        >
                          {!isMine && (
                            <img
                              src={getProfileImage(message.senderId)}
                              alt={message.senderId.username}
                              className="message-avatar"
                            />
                          )}
                          <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                            <p className="message-text">{message.message}</p>
                            <div className="message-meta">
                              <span className="message-time">{formatMessageTime(message.createdAt)}</span>
                              {message.isTemp && <span className="sending-indicator">●</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageText}
                  onChange={handleInputChange}
                  placeholder="Mesajınızı yazın..."
                  disabled={!connected || sending}
                  className="message-input"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || !connected || sending}
                  className="send-button"
                >
                  <FiSend size={20} />
                </button>
              </form>

              {!connected && (
                <div className="connection-warning">
                  Bağlantı yok. Yeniden bağlanılıyor...
                </div>
              )}
            </>
          ) : (
            <div className="no-chat-selected">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Mesajlarınız</h3>
              <p>Sohbet başlatmak için bir konuşma seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
