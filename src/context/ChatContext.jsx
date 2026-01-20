// src/context/ChatContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isMessagesPanelOpen, setIsMessagesPanelOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  // Mesaj panelini aç
  const openMessagesPanel = useCallback(() => {
    setTargetUser(null);
    setIsMessagesPanelOpen(true);
  }, []);

  // Belirli bir kullanıcıyla sohbet başlat
  const openChatWithUser = useCallback((user) => {
    setTargetUser(user);
    setIsMessagesPanelOpen(true);
  }, []);

  // Mesaj panelini kapat
  const closeMessagesPanel = useCallback(() => {
    setIsMessagesPanelOpen(false);
    setTargetUser(null);
  }, []);

  // Target user'ı temizle (panel içinde kullanıldıktan sonra)
  const clearTargetUser = useCallback(() => {
    setTargetUser(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isMessagesPanelOpen,
        targetUser,
        openMessagesPanel,
        openChatWithUser,
        closeMessagesPanel,
        clearTargetUser
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
