// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FiArrowLeft, FiSend, FiMoreVertical } from 'react-icons/fi';
import './ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected, sendMessage: socketSendMessage, markConversationAsRead, startTyping, stopTyping, isUserOnline } = useSocket();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversation();
  }, [userId]);

  useEffect(() => {
    if (!socket || !connected) return;

    // Yeni mesaj geldiğinde
    const handleReceiveMessage = (data) => {
      if (data?.message && data.message.senderId._id === userId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        // Mesajı okundu olarak işaretle
        markConversationAsRead(userId);
      }
    };

    // Typing events
    const handleTypingStart = (data) => {
      if (data?.userId === userId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data?.userId === userId) {
        setIsTyping(false);
      }
    };

    socket.on('message:receive', handleReceiveMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:receive', handleReceiveMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, connected, userId]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversation(userId, { page, limit: 50 });

      if (response.data.success) {
        const fetchedMessages = response.data.messages || [];
        setMessages(fetchedMessages);
        setHasMore(response.data.pagination?.hasMore || false);

        // İlk mesajdaki kullanıcı bilgisini al
        if (fetchedMessages.length > 0) {
          const firstMessage = fetchedMessages[0];
          const other = firstMessage.senderId._id === user._id
            ? firstMessage.recipientId
            : firstMessage.senderId;
          setOtherUser(other);
        }

        // Konuşmayı okundu olarak işaretle
        markConversationAsRead(userId);

        // Scroll to bottom
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Konuşma yüklenemedi:', error);
      toast.error('Konuşma yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!messageText.trim() || sending) return;

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
      recipientId: { _id: userId },
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
      const response = await socketSendMessage(userId, text, tempId);

      // Geçici mesajı gerçek mesajla değiştir
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? response.message : msg
      ));

      scrollToBottom();
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      toast.error(error.message || 'Mesaj gönderilemedi');

      // Geçici mesajı kaldır
      setMessages(prev => prev.filter(msg => msg._id !== tempId));

      // Mesajı geri yükle
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    // Typing indicator
    if (!connected) return;

    startTyping(userId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(userId);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getProfileImage = (user) => {
    if (user?.profileImage && user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    return '/assets/default-profile.png';
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

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;

    messages.forEach(message => {
      const messageDate = format(new Date(message.createdAt), 'yyyy-MM-dd');

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ type: 'date', date: message.createdAt });
      }

      groups.push({ type: 'message', data: message });
    });

    return groups;
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

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <button className="back-button" onClick={() => navigate('/messages')}>
              <FiArrowLeft size={24} />
            </button>
            <div className="header-info">
              <h2>Yükleniyor...</h2>
            </div>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <button className="back-button" onClick={() => navigate('/messages')}>
            <FiArrowLeft size={24} />
          </button>

          <div className="header-info">
            <div className="header-avatar">
              <img src={getProfileImage(otherUser)} alt={otherUser?.username} />
              {isUserOnline(userId) && <span className="online-dot"></span>}
            </div>
            <div className="header-text">
              <h2>
                {otherUser?.firstName && otherUser?.lastName
                  ? `${otherUser.firstName} ${otherUser.lastName}`
                  : `@${otherUser?.username}`}
              </h2>
              {isTyping ? (
                <p className="typing-indicator">yazıyor...</p>
              ) : isUserOnline(userId) ? (
                <p className="status online">Çevrimiçi</p>
              ) : (
                <p className="status">Çevrimdışı</p>
              )}
            </div>
          </div>

          <button className="more-button">
            <FiMoreVertical size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
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
        </div>

        {/* Input */}
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
      </div>
    </div>
  );
};

export default ChatPage;
