// src/context/SocketContext.jsx
import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // Kullanıcı yoksa socket'i disconnect et
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Token al
    const token = localStorage.getItem('token');
    if (!token) return;

    // Socket bağlantısı kur
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnected(false);
    });

    // Online status events
    newSocket.on('user:online', (data) => {
      if (data?.userId) {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      }
    });

    newSocket.on('user:offline', (data) => {
      if (data?.userId) {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
      }
    });

    // Unread count update
    newSocket.on('unread:update', (data) => {
      if (data?.count !== undefined) {
        setUnreadCount(data.count);
      }
    });

    // Server shutdown notification
    newSocket.on('server:shutdown', (data) => {
      console.log('⚠️ Server shutting down:', data?.message);
    });

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  const sendMessage = (recipientId, message, tempId, messageType = 'text') => {
    if (!socketRef.current || !connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      socketRef.current.emit('message:send', {
        recipientId,
        message,
        messageType,
        tempId
      });

      const onSent = (data) => {
        if (data.tempId === tempId) {
          clearTimeout(timeout);
          socketRef.current.off('message:sent', onSent);
          socketRef.current.off('message:error', onError);
          resolve(data);
        }
      };

      const onError = (data) => {
        if (data.tempId === tempId) {
          clearTimeout(timeout);
          socketRef.current.off('message:sent', onSent);
          socketRef.current.off('message:error', onError);
          reject(new Error(data.error || 'Failed to send message'));
        }
      };

      socketRef.current.on('message:sent', onSent);
      socketRef.current.on('message:error', onError);
    });
  };

  const markMessageAsRead = (messageId, senderId) => {
    if (!socketRef.current || !connected) return;
    socketRef.current.emit('message:read', { messageId, senderId });
  };

  const markConversationAsRead = (otherUserId) => {
    if (!socketRef.current || !connected) return;
    socketRef.current.emit('conversation:read', { otherUserId });
  };

  const startTyping = (recipientId) => {
    if (!socketRef.current || !connected) return;
    socketRef.current.emit('typing:start', { recipientId });
  };

  const stopTyping = (recipientId) => {
    if (!socketRef.current || !connected) return;
    socketRef.current.emit('typing:stop', { recipientId });
  };

  const checkOnlineStatus = (userIds) => {
    if (!socketRef.current || !connected) return;
    socketRef.current.emit('users:online', userIds);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket: socketRef.current,
    connected,
    onlineUsers,
    unreadCount,
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    startTyping,
    stopTyping,
    checkOnlineStatus,
    isUserOnline,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
