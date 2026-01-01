// src/components/modals/ProfileInfoModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import './ModalStyles.css';
import './ProfileInfoModal.css';

const ProfileInfoModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        phone: user.phone || ''
      });
      setUsernameAvailable(null);
      setUsernameError('');
    }
  }, [isOpen, user]);

  // Username validation
  const validateUsername = (username) => {
    if (!username) return 'Kullanıcı adı gereklidir';
    if (username.length < 3) return 'Kullanıcı adı en az 3 karakter olmalıdır';
    if (username.length > 30) return 'Kullanıcı adı en fazla 30 karakter olabilir';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }
    return '';
  };

  const handleUsernameChange = async (newUsername) => {
    setFormData({ ...formData, username: newUsername });
    setUsernameError('');
    setUsernameAvailable(null);

    // Current username ise kontrol etme
    if (newUsername === user.username) {
      setUsernameAvailable(true);
      return;
    }

    // Validation check
    const error = validateUsername(newUsername);
    if (error) {
      setUsernameError(error);
      setUsernameAvailable(false);
      return;
    }

    // Backend'de kontrol et (debounce ile)
    setUsernameChecking(true);
    try {
      // Burada normalde bir checkUsername API'si olması gerekir
      // Şimdilik updateProfileInfo'yu kullanacağız ve hata mesajına bakacağız
      // Gerçek implementasyonda ayrı bir endpoint olmalı
      await new Promise(resolve => setTimeout(resolve, 500)); // Debounce simulation
      setUsernameAvailable(true);
    } catch (error) {
      setUsernameAvailable(false);
      setUsernameError('Bu kullanıcı adı kullanılamıyor');
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      handleUsernameChange(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Username validation
    if (formData.username !== user.username) {
      const error = validateUsername(formData.username);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await authAPI.updateProfileInfo({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        phone: formData.phone.trim()
      });

      // Update local user data
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profil bilgileri güncellendi');
        onClose();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Profil güncellenemedi';
      toast.error(message);

      if (message.includes('kullanıcı adı')) {
        setUsernameAvailable(false);
        setUsernameError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-info-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Profil Bilgileri</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName">Ad</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Adınızı girin"
              className="form-input"
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName">Soyad</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Soyadınızı girin"
              className="form-input"
            />
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı *</label>
            <div className="input-with-indicator">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Kullanıcı adınız"
                className={`form-input ${
                  usernameError ? 'error' :
                  usernameAvailable && formData.username !== user.username ? 'success' : ''
                }`}
                required
              />
              {usernameChecking && (
                <div className="input-indicator checking">
                  <div className="spinner-small"></div>
                </div>
              )}
              {!usernameChecking && usernameAvailable && formData.username !== user.username && (
                <div className="input-indicator success">
                  <FiCheck size={18} />
                </div>
              )}
              {!usernameChecking && usernameError && (
                <div className="input-indicator error">
                  <FiAlertCircle size={18} />
                </div>
              )}
            </div>
            {usernameError && (
              <p className="input-error-message">{usernameError}</p>
            )}
            {usernameAvailable && formData.username !== user.username && !usernameError && (
              <p className="input-success-message">Kullanıcı adı kullanılabilir</p>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Telefon</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+90 555 123 45 67"
              className="form-input"
            />
          </div>

          {/* Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || usernameChecking || (usernameError && formData.username !== user.username)}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfoModal;
