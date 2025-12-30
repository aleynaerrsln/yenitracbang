// src/pages/Auth.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import '../components/auth/Auth.css';

const Auth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Zaten giriş yapmışsa Discovery sayfasına yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Auth;