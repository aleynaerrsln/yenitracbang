// src/components/modals/PasswordChangeModal.jsx
import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiX, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './ModalStyles.css';
import './PasswordChangeModal.css';

const PasswordChangeModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
      setPasswordStrength(0);
    }
  }, [isOpen]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('Yeni şifre mevcut şifre ile aynı olamaz');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        toast.success('Şifre başarıyla değiştirildi');
        onClose();
      }
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || 'Şifre değiştirilemedi';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Zayıf';
      case 2:
        return 'Orta';
      case 3:
        return 'İyi';
      case 4:
        return 'Güçlü';
      default:
        return '';
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return '#FF6B6B';
      case 2:
        return '#F39C12';
      case 3:
        return '#3498DB';
      case 4:
        return '#2ECC71';
      default:
        return '#95A5A6';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content password-change-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Şifre Değiştir</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <p className="modal-description">
            Hesap güvenliğiniz için güçlü bir şifre seçin.
          </p>

          {/* Current Password */}
          <div className="form-group">
            <label htmlFor="currentPassword">Mevcut Şifre</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" size={20} />
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Mevcut şifrenizi girin"
                className="form-input with-icon with-action"
                required
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">Yeni Şifre</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" size={20} />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Yeni şifrenizi girin"
                className="form-input with-icon with-action"
                required
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${passwordStrength >= level ? 'active' : ''}`}
                      style={{
                        backgroundColor: passwordStrength >= level ? getStrengthColor() : 'rgba(255,255,255,0.1)'
                      }}
                    />
                  ))}
                </div>
                <span
                  className="strength-label"
                  style={{ color: getStrengthColor() }}
                >
                  {getStrengthLabel()}
                </span>
              </div>
            )}
            <p className="input-hint">En az 6 karakter, büyük/küçük harf ve sayı içermeli</p>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" size={20} />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Yeni şifrenizi tekrar girin"
                className="form-input with-icon with-action"
                required
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="input-error-message">Şifreler eşleşmiyor</p>
            )}
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
              disabled={loading || formData.newPassword !== formData.confirmPassword}
            >
              {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
