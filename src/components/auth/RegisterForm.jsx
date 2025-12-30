// src/components/auth/RegisterForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const RegisterForm = ({ onToggle }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userTag: 'none',
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

    // Basit validasyon
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      // Discovery sayfasına yönlendir
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <img src="/logo.png" alt="TrackBang" className="auth-logo" />
        <p>TrackBang'e ücretsiz katıl</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              placeholder="İsim"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="lastName"
              placeholder="Soyisim"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="E-posta"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Kullanıcı adı"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
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
            minLength="6"
          />
        </div>

        <div className="form-group">
          <select
            name="userTag"
            value={formData.userTag}
            onChange={handleChange}
          >
            <option value="none">Kullanıcı Tipi Seç</option>
            <option value="dj">DJ</option>
            <option value="producer">Prodüktör</option>
            <option value="dj-producer">DJ & Prodüktör</option>
            <option value="distributor">Distribütör</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Kayıt yapılıyor...' : 'Ücretsiz Kayıt Ol'}
        </button>

        <p className="trial-info">
          7 günlük ücretsiz deneme ile başla
        </p>
      </form>

      <div className="auth-footer">
        <p>
          Zaten hesabın var mı?{' '}
          <button onClick={onToggle} className="link-button">
            Giriş Yap
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;