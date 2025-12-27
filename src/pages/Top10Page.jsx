// src/pages/Top10Page.jsx

import { useState, useEffect } from 'react';
import { musicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiHeart, FiPlay } from 'react-icons/fi';
import './Top10Page.css';

const Top10Page = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeGenre, setActiveGenre] = useState('all');
  const [top10Data, setTop10Data] = useState({});
  const [loading, setLoading] = useState(true);

  const genres = [
    { id: 'all', name: 'All Categories', label: 'Tümü' },
    { id: 'afrohouse', name: 'Afro House', label: 'Afro House' },
    { id: 'indiedance', name: 'Indie Dance', label: 'Indie Dance' },
    { id: 'organichouse', name: 'Organic House', label: 'Organic House' },
    { id: 'downtempo', name: 'Downtempo', label: 'Downtempo' },
    { id: 'melodichouse', name: 'Melodic House', label: 'Melodic House' }
  ];

  useEffect(() => {
    fetchTop10();
  }, [activeGenre]);

  const fetchTop10 = async () => {
    try {
      setLoading(true);
      const genre = activeGenre === 'all' ? undefined : activeGenre;
      const response = await musicAPI.getTop10ByCategory(genre);

      if (response.data.success) {
        setTop10Data(response.data.data.top10);
      }
    } catch (error) {
      console.error('Fetch top10 error:', error);
      toast.error('Failed to load top 10');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (musicId, e) => {
    e.stopPropagation();

    try {
      await musicAPI.likeMusic(musicId);

      // Yerel state'i güncelle
      setTop10Data(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(genre => {
          newData[genre] = newData[genre].map(music =>
            music._id === musicId
              ? { ...music, isLiked: !music.isLiked, likes: music.isLiked ? music.likes - 1 : music.likes + 1 }
              : music
          );
        });
        return newData;
      });

    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like music');
    }
  };

  const handlePlayMusic = (music, e) => {
    e.stopPropagation();
    // Play fonksiyonu eklenecek
    console.log('Playing:', music.title);
  };

  const renderGenreSection = (genreId, genreName) => {
    const musics = top10Data[genreId] || [];

    if (musics.length === 0) return null;

    return (
      <div key={genreId} className="genre-section">
        <h2 className="genre-title">{genreName}</h2>

        <div className="top10-grid">
          {musics.map((music, index) => (
            <div key={music._id} className="top10-card">
              <div className="rank-badge">#{index + 1}</div>

              <div className="music-artwork">
                <img src={music.imageUrl} alt={music.title} />
                <button
                  className="play-overlay"
                  onClick={(e) => handlePlayMusic(music, e)}
                >
                  <FiPlay size={24} />
                </button>
              </div>

              <div className="music-info">
                <h3 className="music-title">{music.title}</h3>
                <p className="music-artists">
                  {music.artists?.map(a => a.name).join(', ') || music.artistNames || 'Unknown Artist'}
                </p>
              </div>

              <div className="music-stats">
                <button
                  className={`like-btn ${music.isLiked ? 'liked' : ''}`}
                  onClick={(e) => handleLike(music._id, e)}
                >
                  <FiHeart size={16} fill={music.isLiked ? 'currentColor' : 'none'} />
                  <span>{music.likes || 0}</span>
                </button>
                <span className="views-count">{music.views || 0} views</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="top10-page">
      <div className="top10-header">
        <h1>Top 10 Tracks</h1>
        <p>En çok beğenilen şarkılar</p>
      </div>

      <div className="genre-tabs">
        {genres.map(genre => (
          <button
            key={genre.id}
            className={`genre-tab ${activeGenre === genre.id ? 'active' : ''}`}
            onClick={() => setActiveGenre(genre.id)}
          >
            {genre.label}
          </button>
        ))}
      </div>

      <div className="top10-content">
        {loading ? (
          <div className="loading-state">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-genre-section">
                <div className="skeleton-title"></div>
                <div className="skeleton-grid">
                  {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="skeleton-card"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activeGenre === 'all' ? (
          Object.keys(top10Data).map(genreId => {
            const genre = genres.find(g => g.id === genreId);
            return renderGenreSection(genreId, genre?.name || genreId);
          })
        ) : (
          renderGenreSection(activeGenre, genres.find(g => g.id === activeGenre)?.name || activeGenre)
        )}
      </div>
    </div>
  );
};

export default Top10Page;
