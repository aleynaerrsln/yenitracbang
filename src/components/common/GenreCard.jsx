// src/components/common/GenreCard.jsx - YAPI DEĞİŞİKLİĞİ

import { useNavigate } from 'react-router-dom';
import './GenreCard.css';

const GenreCard = ({ genre }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/genre/${genre.slug}`);
  };

  return (
    <div className="genre-card-wrapper" onClick={handleClick}>
      <div className="genre-card">
        <img src={genre.squareImage} alt={genre.displayName} />
      </div>
      <div className="genre-card-title">
        <h3>{genre.displayName}</h3>
      </div>
    </div>
  );
};

export default GenreCard;