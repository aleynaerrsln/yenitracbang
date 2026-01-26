// src/pages/ListsPage.jsx - Genre Categories View

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { genreAPI } from '../services/api';
import './ListsPage.css';

const ListsPage = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default color mapping for genres
  const defaultColors = {
    'afrohouse': '#8B5CF6',
    'melodichouse': '#F97316',
    'organichouse': '#10B981',
    'downtempo': '#3B82F6',
    'indiedance': '#EAB308',
    'techno': '#EF4444',
    'deephouse': '#06B6D4',
    'house': '#EC4899',
    'trance': '#8B5CF6',
    'electronica': '#14B8A6'
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await genreAPI.getAllGenres();
      if (response.data.success && response.data.data) {
        // Backend verilerini mevcut yapıya uygun şekilde dönüştür
        // List sayfası için uzun/wide resim kullan, yoksa kare resme fallback
        const transformedGenres = response.data.data.map(genre => ({
          id: genre._id || genre.slug,
          name: genre.displayName || genre.name,
          slug: genre.slug,
          color: genre.color || defaultColors[genre.slug] || '#F97316',
          image: genre.wideImage || genre.listImage || genre.bannerImage || genre.squareImage || genre.imageUrl || genre.image
        }));
        setGenres(transformedGenres);
      }
    } catch (error) {
      console.error('Genres fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = (slug) => {
    navigate(`/genre/${slug}`);
  };

  return (
    <div className="lists-page">
      <div className="lists-header">
        <h1>Lists</h1>
      </div>

      {loading ? (
        <div className="genre-cards">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="genre-card skeleton">
              <div className="genre-card-image skeleton-image"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="genre-cards">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="genre-card"
              onClick={() => handleGenreClick(genre.slug)}
              style={{ '--accent-color': genre.color }}
            >
              <div className="genre-card-image">
                <img src={genre.image} alt={genre.name} />
                <div className="genre-overlay"></div>
                <div className="genre-accent-bar"></div>
              </div>
              <h2 className="genre-name">{genre.name}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListsPage;
