// src/components/common/GenreCard.jsx - YAPI DEĞİŞİKLİĞİ

import { useNavigate } from 'react-router-dom';
import './GenreCard.css';

const GenreCard = ({ genre }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/genre/${genre.slug}`);
  };

  return (
    <div className="genre-card" onClick={handleClick}>
      <img src={genre.squareImage} alt={genre.displayName} />
      <div className="genre-card-overlay">
        <h3>{genre.displayName}</h3>
      </div>
    </div>
  );
};

export default GenreCard;