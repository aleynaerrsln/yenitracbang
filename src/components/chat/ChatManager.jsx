// src/components/chat/ChatManager.jsx
import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatWidget from './ChatWidget';

const ChatManager = ({ isOpen, onClose }) => {
  const [openChats, setOpenChats] = useState([]);
  const [showChatList, setShowChatList] = useState(isOpen);

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
    setShowChatList(false);
    onClose();
  };

  // Chat widgetlarını sağdan sola sıralamak için
  const getBottomPosition = (index) => {
    return 20 + (index * 380); // Her chat 360px genişlik + 20px boşluk
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
        <div
          key={user._id}
          style={{ right: `${getBottomPosition(index)}px` }}
          className="chat-widget-wrapper"
        >
          <ChatWidget
            recipientId={user._id}
            recipientInfo={user}
            onClose={() => handleCloseChat(user._id)}
          />
        </div>
      ))}
    </>
  );
};

export default ChatManager;
