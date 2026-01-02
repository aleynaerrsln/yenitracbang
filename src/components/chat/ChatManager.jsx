// src/components/chat/ChatManager.jsx
import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWidget from './ChatWidget';

const ChatManager = ({ isOpen, onClose }) => {
  const [openChats, setOpenChats] = useState([]);
  const [showChatList, setShowChatList] = useState(false);

  // isOpen değiştiğinde showChatList'i güncelle
  useEffect(() => {
    if (isOpen && !showChatList) {
      setShowChatList(true);
    }
  }, [isOpen, showChatList]);

  const handleSelectConversation = (user) => {
    // Zaten açık mı kontrol et
    const existingIndex = openChats.findIndex(chat => chat._id === user._id);

    if (existingIndex === -1) {
      // Maksimum 3 chat açık olabilir
      if (openChats.length >= 3) {
        // En eski chat'i kapat
        setOpenChats(prev => [...prev.slice(1), user]);
      } else {
        setOpenChats(prev => [...prev, user]);
      }
    }

    // Chat listesini kapat
    setShowChatList(false);
  };

  const handleCloseChat = (userId) => {
    setOpenChats(prev => prev.filter(chat => chat._id !== userId));
  };

  const handleBackToList = (userId) => {
    // Chat widget'ı kapat ve chat listesini göster
    setOpenChats(prev => prev.filter(chat => chat._id !== userId));
    setShowChatList(true);
  };

  const handleCloseChatList = () => {
    setShowChatList(false);
    setOpenChats([]); // Açık tüm chatları kapat
    onClose();
  };

  // Chat widgetlarını sağdan sola sıralamak için
  const getRightPosition = (index) => {
    const chatListWidth = showChatList ? 380 : 0; // Chat list açıksa onun genişliği
    return chatListWidth + (index * 380) + 20; // Her chat 360px genişlik + 20px boşluk
  };

  // Hiçbir şey açık değilse render etme
  if (!showChatList && openChats.length === 0) {
    return null;
  }

  return (
    <>
      {/* Chat List */}
      {showChatList && (
        <ChatList
          onSelectConversation={handleSelectConversation}
          onClose={handleCloseChatList}
        />
      )}

      {/* Open Chats */}
      {openChats.map((user, index) => (
        <ChatWidget
          key={user._id}
          recipientId={user._id}
          recipientInfo={user}
          onBack={() => handleBackToList(user._id)}
          onClose={() => handleCloseChat(user._id)}
          style={{ right: `${getRightPosition(index)}px` }}
        />
      ))}
    </>
  );
};

export default ChatManager;
