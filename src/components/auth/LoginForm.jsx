// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaGooglePlay, FaApple } from 'react-icons/fa';
import './Auth.css';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '', // email veya username
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Email mi username mi kontrol et
      const isEmail = formData.identifier.includes('@');

      await login({
        [isEmail ? 'email' : 'username']: formData.identifier,
        password: formData.password,
      });

      // Discovery sayfasına yönlendir
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <img src="/logo.png" alt="TrackBang" className="auth-logo" />
        <p></p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <input
            type="text"
            name="identifier"
            placeholder="E-posta veya kullanıcı adı"
            value={formData.identifier}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            minLength="6"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="auth-footer">
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', margin: '0 0 0.5rem 0', textAlign: 'center' }}>
          Henüz hesabın yok mu?
        </p>
        <p className="download-info">
          Kayıt olmak için mobil uygulamayı indir
        </p>
        <div className="download-stores">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
          >
            <FaGooglePlay size={24} className="store-icon" />
            <div className="store-text">
              <span className="store-label">Download on</span>
              <span className="store-name">Google Play</span>
            </div>
          </a>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
          >
            <FaApple size={28} className="store-icon" />
            <div className="store-text">
              <span className="store-label">Download on the</span>
              <span className="store-name">App Store</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;