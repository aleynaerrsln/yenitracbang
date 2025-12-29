// src/components/common/GenreCard.jsx - MODERN DESIGN

import { useNavigate } from 'react-router-dom';
import './GenreCard.css';

const GenreCard = ({ genre }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/genre/${genre.slug}`);
  };

  // Generate vibrant gradient based on genre name
  const getGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="genre-card-wrapper-modern" onClick={handleClick}>
      <div className="genre-card-modern">
        {genre.squareImage ? (
          <>
            <img src={genre.squareImage} alt={genre.displayName} className="genre-card-image" />
            <div className="genre-card-overlay"></div>
          </>
        ) : (
          <div
            className="genre-card-gradient"
            style={{ background: getGradient(genre.displayName) }}
          ></div>
        )}
      </div>
      <h3 className="genre-card-name">{genre.displayName}</h3>
    </div>
  );
};

export default GenreCard;