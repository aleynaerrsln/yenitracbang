// src/components/chat/ChatManager.jsx
import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWidget from './ChatWidget';

const ChatManager = ({ isOpen, onClose }) => {
  const [openChats, setOpenChats] = useState([]);
  const [showChatList, setShowChatList] = useState(isOpen);

  console.log('ChatManager render - isOpen:', isOpen, 'showChatList:', showChatList);

  // isOpen değiştiğinde showChatList'i güncelle
  useEffect(() => {
    console.log('ChatManager: isOpen changed to:', isOpen);
    setShowChatList(isOpen);
    console.log('ChatManager: showChatList set to:', isOpen);
  }, [isOpen]);

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

  const handleCloseChatList = () => {
    console.log('ChatManager: handleCloseChatList called');
    setShowChatList(false);
    console.log('ChatManager: showChatList set to false');
    onClose();
    console.log('ChatManager: onClose called');
  };

  // Chat widgetlarını sağdan sola sıralamak için
  const getRightPosition = (index) => {
    const chatListWidth = showChatList ? 380 : 0; // Chat list açıksa onun genişliği
    return chatListWidth + (index * 380) + 20; // Her chat 360px genişlik + 20px boşluk
  };

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
          onClose={() => handleCloseChat(user._id)}
          style={{ right: `${getRightPosition(index)}px` }}
        />
      ))}
    </>
  );
};

export default ChatManager;
