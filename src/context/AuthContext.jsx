// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  // Sayfa yüklendiğinde kullanıcıyı kontrol et
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token) {
      setLoading(false);
      return;
    }

    // Önce localStorage'daki user'ı set et (hızlı yükleme için)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }

    try {
      // Backend'den güncel user bilgisini al
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setSubscription(response.data.subscription);
      // localStorage'ı güncelle
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Auth check failed:', error);
      // Sadece 401 (Unauthorized) hatası varsa logout yap
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setSubscription(null);
      }
      // Diğer hatalarda (network error vs.) localStorage'daki user'ı kullan
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user, subscription } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    setSubscription(subscription);
    
    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, user, subscription } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    setSubscription(subscription);
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSubscription(null);
    authAPI.logout().catch(() => {});
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    subscription,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};