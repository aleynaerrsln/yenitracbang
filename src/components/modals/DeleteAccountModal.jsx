// src/components/modals/DeleteAccountModal.jsx
import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiX, FiAlertTriangle, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './ModalStyles.css';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [step, setStep] = useState(1); // 1: Warning, 2: Password confirmation
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPassword('');
      setConfirmText('');
    }
  }, [isOpen]);

  const handleContinue = () => {
    setStep(2);
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    // Validation
    if (confirmText !== 'HESABIMI SIL') {
      toast.error('Lütfen "HESABIMI SIL" yazarak onaylayın');
      return;
    }

    if (!password.trim()) {
      toast.error('Lütfen şifrenizi girin');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.deleteAccount({ password });

      if (response.data.success) {
        toast.success('Hesabınız kalıcı olarak silindi');
        logout();
        onClose();
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      const message = error.response?.data?.message || 'Hesap silinemedi';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-account-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header danger-header">
          <div className="danger-header-icon">
            <FiAlertTriangle size={24} />
          </div>
          <h2>Hesabı Kalıcı Olarak Sil</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {step === 1 ? (
          // Step 1: Warning
          <div className="modal-body">
            <div className="warning-content">
              <p className="warning-text">
                Bu işlem <strong>geri alınamaz</strong>. Hesabınızı sildiğinizde:
              </p>
              <ul className="warning-list">
                <li>Tüm profil bilgileriniz kalıcı olarak silinecek</li>
                <li>Tüm müzik geçmişiniz ve favorileriniz kaybolacak</li>
                <li>Takipçileriniz ve takip ettikleriniz silinecek</li>
                <li>Tüm gönderileriniz ve yorumlarınız kaldırılacak</li>
                <li>Bu hesaba bir daha erişemeyeceksiniz</li>
              </ul>
              <div className="warning-box">
                <FiAlertTriangle size={20} />
                <p>
                  Bu işlem sonrasında hesabınızı geri yükleyemezsiniz. Emin misiniz?
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                İptal Et
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleContinue}
              >
                Devam Et
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Password confirmation
          <form onSubmit={handleDelete} className="modal-form">
            <div className="modal-body">
              <p className="modal-description">
                Hesabınızı silmek için lütfen şifrenizi girin ve onaylayın.
              </p>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password">Şifreniz</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" size={20} />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    className="form-input with-icon"
                    required
                  />
                </div>
              </div>

              {/* Confirmation Text */}
              <div className="form-group">
                <label htmlFor="confirmText">
                  Onaylamak için <strong className="danger-text">"HESABIMI SIL"</strong> yazın
                </label>
                <input
                  type="text"
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="HESABIMI SIL"
                  className="form-input"
                  required
                />
              </div>

              <div className="warning-box small">
                <FiAlertTriangle size={16} />
                <p>Bu işlem geri alınamaz!</p>
              </div>
            </div>

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
                className="btn-danger"
                disabled={loading || confirmText !== 'HESABIMI SIL'}
              >
                {loading ? 'Siliniyor...' : 'Hesabı Kalıcı Olarak Sil'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;
