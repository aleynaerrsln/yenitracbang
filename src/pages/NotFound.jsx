// src/pages/NotFound.jsx
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="error-emoji">😕</div>
        <h1>404</h1>
        <h2>Sayfa Bulunamadı</h2>
        <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        
        <div className="not-found-actions">
          <button 
            className="btn-home" 
            onClick={() => navigate('/')}
          >
            🏠 Ana Sayfaya Dön
          </button>
          
          <button 
            className="btn-back" 
            onClick={() => navigate(-1)}
          >
            ← Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;