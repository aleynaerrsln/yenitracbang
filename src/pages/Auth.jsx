// src/pages/Auth.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import '../components/auth/Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Zaten giriş yapmışsa Discovery sayfasına yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <LoginForm onToggle={toggleForm} />
        ) : (
          <RegisterForm onToggle={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default Auth;