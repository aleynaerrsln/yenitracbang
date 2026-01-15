// src/components/chat/ChatManager.jsx
// Bu bileşen artık sadece mesajlar sayfasına yönlendiriyor - popup chat widget'lar kaldırıldı
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatManager = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Mesajlar sayfasına yönlendir
      navigate('/messages');
      // Manager'ı kapat
      onClose();
    }
  }, [isOpen, navigate, onClose]);

  // Artık hiçbir şey render etmiyoruz - tüm mesajlaşma MessagesPage'de
  return null;
};

export default ChatManager;
