// src/pages/ListsPage.jsx - Genre Categories View

import { useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import './ListsPage.css';

const ListsPage = () => {
  const navigate = useNavigate();

  const genres = [
    {
      id: 'afrohouse',
      name: 'Afro House',
      slug: 'afrohouse',
      color: '#8B5CF6',
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80'
    },
    {
      id: 'melodichouse',
      name: 'Melodic House',
      slug: 'melodichouse',
      color: '#F97316',
      image: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800&q=80'
    },
    {
      id: 'organichouse',
      name: 'Organic House',
      slug: 'organichouse',
      color: '#10B981',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'
    },
    {
      id: 'downtempo',
      name: 'Downtempo',
      slug: 'downtempo',
      color: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'
    },
    {
      id: 'indiedance',
      name: 'Indie Dance',
      slug: 'indiedance',
      color: '#EAB308',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
    }
  ];

  const handleGenreClick = (slug) => {
    navigate(`/genre/${slug}`);
  };

  return (
    <div className="lists-page">
      <div className="lists-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <h1>Listeler</h1>
      </div>

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
    </div>
  );
};

export default ListsPage;
