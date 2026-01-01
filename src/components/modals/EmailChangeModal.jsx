// src/components/modals/EmailChangeModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiX, FiMail, FiLock } from 'react-icons/fi';
import './ModalStyles.css';
import './EmailChangeModal.css';

const EmailChangeModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1); // 1: Email ve şifre, 2: Kod doğrulama
  const [formData, setFormData] = useState({
    newEmail: '',
    password: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        newEmail: '',
        password: '',
        code: ''
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.newEmail)) {
      toast.error('Geçersiz email formatı');
      return;
    }

    // Check if same as current email
    if (formData.newEmail === user.email) {
      toast.error('Yeni email mevcut email ile aynı olamaz');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.requestEmailUpdate({
        newEmail: formData.newEmail,
        password: formData.password
      });

      if (response.data.success) {
        toast.success('Doğrulama kodu email adresinize gönderildi');
        setStep(2);
      }
    } catch (error) {
      console.error('Email update request error:', error);
      const message = error.response?.data?.message || 'Email güncellenemedi';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailChange = async (e) => {
    e.preventDefault();

    if (!formData.code || formData.code.length !== 6) {
      toast.error('Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.confirmEmailUpdate({
        code: formData.code
      });

      if (response.data.success) {
        // Update local user data
        updateUser(response.data.user);
        toast.success('Email adresi başarıyla güncellendi');
        onClose();
      }
    } catch (error) {
      console.error('Email confirm error:', error);
      const message = error.response?.data?.message || 'Doğrulama başarısız';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await authAPI.requestEmailUpdate({
        newEmail: formData.newEmail,
        password: formData.password
      });
      toast.success('Doğrulama kodu tekrar gönderildi');
    } catch (error) {
      toast.error('Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content email-change-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Email Adresi Değiştir</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Step 1: Email ve Şifre */}
        {step === 1 && (
          <form onSubmit={handleRequestEmailChange} className="modal-form">
            <div className="current-email-info">
              <span className="info-label">Mevcut Email:</span>
              <span className="info-value">{user?.email || 'Kayıtlı değil'}</span>
            </div>

            <div className="form-group">
              <label htmlFor="newEmail">Yeni Email Adresi *</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" size={20} />
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleChange}
                  placeholder="yeni@email.com"
                  className="form-input with-icon"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mevcut Şifreniz *</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifrenizi girin"
                  className="form-input with-icon"
                  autoComplete="new-password"
                  required
                />
              </div>
              <p className="input-hint">Güvenlik için mevcut şifrenizi girmeniz gerekiyor</p>
            </div>

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
                disabled={loading}
              >
                {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Kod Doğrulama */}
        {step === 2 && (
          <form onSubmit={handleConfirmEmailChange} className="modal-form">
            <p className="modal-description">
              <strong>{formData.newEmail}</strong> adresine gönderilen 6 haneli doğrulama kodunu girin.
            </p>

            <div className="form-group">
              <label htmlFor="code">Doğrulama Kodu</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="000000"
                className="form-input code-input"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                autoFocus
              />
            </div>

            <button
              type="button"
              className="resend-code-btn"
              onClick={handleResendCode}
              disabled={loading}
            >
              Kodu tekrar gönder
            </button>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Geri
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Doğrulanıyor...' : 'Doğrula'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailChangeModal;
