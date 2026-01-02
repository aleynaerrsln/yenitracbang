// src/components/chat/ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { format, isToday } from 'date-fns';
import { FiX, FiMinus, FiSend, FiMessageCircle, FiArrowLeft } from 'react-icons/fi';
import './ChatWidget.css';

const ChatWidget = ({ recipientId, recipientInfo, onBack, onClose, style }) => {
  const { user } = useAuth();
  const { socket, connected, sendMessage: socketSendMessage, isUserOnline, markConversationAsRead } = useSocket();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Konuşmayı açtığımızda mesajları okundu olarak işaretle
    if (recipientId && markConversationAsRead) {
      markConversationAsRead(recipientId);
    }
  }, [recipientId]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleReceiveMessage = (data) => {
      if (data?.message && data.message.senderId._id === recipientId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        // Mesaj geldiğinde hemen okundu olarak işaretle (chat açıkken)
        if (markConversationAsRead) {
          markConversationAsRead(recipientId);
        }
      }
    };

    const handleTypingStart = (data) => {
      if (data?.userId === recipientId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data?.userId === recipientId) {
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
  }, [socket, connected, recipientId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversation(recipientId, { limit: 50 });
      if (response.data.success) {
        setMessages(response.data.messages || []);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || sending || !connected) return;

    const text = messageText.trim();
    const tempId = `temp_${Date.now()}`;

    const tempMessage = {
      _id: tempId,
      senderId: { _id: user._id, username: user.username, profileImage: user.profileImage },
      recipientId: { _id: recipientId },
      message: text,
      createdAt: new Date().toISOString(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageText('');
    setSending(true);
    scrollToBottom();

    try {
      const response = await socketSendMessage(recipientId, text, tempId);
      setMessages(prev => prev.map(msg => msg._id === tempId ? response.message : msg));
      scrollToBottom();
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setMessageText(text);
    } finally {
      setSending(false);
    }
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

  const formatTime = (date) => {
    const messageDate = new Date(date);
    return isToday(messageDate) ? format(messageDate, 'HH:mm') : format(messageDate, 'dd/MM HH:mm');
  };

  if (isMinimized) {
    return (
      <div className="chat-widget minimized" style={style} onClick={() => setIsMinimized(false)}>
        <div className="chat-widget-minimized-header">
          <div className="minimized-avatar">
            <img src={getProfileImage(recipientInfo)} alt={recipientInfo?.username} />
            {isUserOnline(recipientId) && <span className="online-dot-mini"></span>}
          </div>
          <div className="minimized-info">
            <span className="minimized-name">
              {recipientInfo?.firstName && recipientInfo?.lastName
                ? `${recipientInfo.firstName} ${recipientInfo.lastName}`
                : `@${recipientInfo?.username}`}
            </span>
          </div>
          <button className="minimized-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <FiX size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-widget" style={style}>
      {/* Header */}
      <div className="chat-widget-header">
        <button onClick={onBack} className="widget-btn widget-back-btn" title="Geri">
          <FiArrowLeft size={20} />
        </button>
        <div className="chat-widget-user">
          <div className="chat-widget-avatar">
            <img src={getProfileImage(recipientInfo)} alt={recipientInfo?.username} />
            {isUserOnline(recipientId) && <span className="online-dot-widget"></span>}
          </div>
          <div className="chat-widget-user-info">
            <h4>
              {recipientInfo?.firstName && recipientInfo?.lastName
                ? `${recipientInfo.firstName} ${recipientInfo.lastName}`
                : `@${recipientInfo?.username}`}
            </h4>
            {isTyping ? (
              <span className="typing-text">yazıyor...</span>
            ) : isUserOnline(recipientId) ? (
              <span className="online-text">Çevrimiçi</span>
            ) : (
              <span className="offline-text">Çevrimdışı</span>
            )}
          </div>
        </div>
        <div className="chat-widget-actions">
          <button onClick={() => setIsMinimized(true)} className="widget-btn" title="Küçült">
            <FiMinus size={18} />
          </button>
          <button onClick={onClose} className="widget-btn" title="Kapat">
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-widget-messages">
        {loading ? (
          <div className="chat-widget-loading">
            <div className="spinner-small"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-widget-empty">
            <FiMessageCircle size={40} />
            <p>Henüz mesaj yok</p>
            <span>İlk mesajı gönder!</span>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId._id === user._id;
            return (
              <div key={message._id} className={`widget-message ${isMine ? 'mine' : 'theirs'}`}>
                {!isMine && (
                  <img
                    src={getProfileImage(message.senderId)}
                    alt={message.senderId.username}
                    className="widget-message-avatar"
                  />
                )}
                <div className={`widget-message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  <p>{message.message}</p>
                  <span className="widget-message-time">{formatTime(message.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-widget-input" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Mesajınızı yazın..."
          disabled={!connected || sending}
        />
        <button type="submit" disabled={!messageText.trim() || !connected || sending}>
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
