// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LoginForm = ({ onToggle }) => {
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
        <h1>trackbang</h1>
        <p>Müziğin Yeni Adresi</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <input
            type="text"
            name="identifier"
            placeholder="Email veya Kullanıcı Adı"
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
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Hesabın yok mu?{' '}
          <button onClick={onToggle} className="link-button">
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;