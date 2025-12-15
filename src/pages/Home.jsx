// src/pages/Home.jsx - TAM HAL

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import MainContent from '../components/layout/MainContent';
import './Home.css';

const Home = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <h1>trackbang</h1>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <MainContent />
    </MainLayout>
  );
};

export default Home;