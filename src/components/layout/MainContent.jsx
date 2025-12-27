// src/components/layout/MainContent.jsx - MİNİMALİST HEADER
import { useState, useEffect } from 'react';
import { genreAPI, hotAPI } from '../../services/api';
import GenreCard from '../common/GenreCard';
import PlaylistCard from '../common/PlaylistCard';
import './MainContent.css';

const MainContent = () => {
  const [genres, setGenres] = useState([]);
  const [hotPlaylists, setHotPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [genresRes, hotRes] = await Promise.all([
        genreAPI.getAllGenres(),
        hotAPI.getHotPlaylists()
      ]);

      console.log('Genres Response:', genresRes);
      console.log('Hot Response:', hotRes);

      if (genresRes.data.success) {
        setGenres(genresRes.data.data || []); 
      }

      if (hotRes.data.success) {
        setHotPlaylists(hotRes.data.hotPlaylists || []);
      }

    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Main Content */}
      <div className="content-scroll">
        {/* Genres Section */}
        <section className="content-section">
          <h2 className="section-title">Genres</h2>
          
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="genres-grid">
              {genres.map((genre) => (
                <GenreCard
                  key={genre._id || genre.slug}
                  genre={{
                    ...genre,
                    color: genre.primaryColor || '#667eea'
                  }}
                  onClick={() => console.log('Genre clicked:', genre.slug)}
                />
              ))}
            </div>
          )}
        </section>

        {/* What's Hot Section */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">What's Hot</h2>
            <button className="view-all-btn">View All</button>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="playlists-grid">
              {hotPlaylists
                .filter(p => !p.isEmpty)
                .slice(0, 6)
                .map((playlist) => (
                  <PlaylistCard
                    key={playlist._id}
                    playlist={playlist}
                    onClick={() => console.log('Playlist clicked:', playlist._id)}
                  />
                ))}
            </div>
          )}
        </section>

        {/* DJ Charts Section */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">DJ Charts</h2>
            <button className="view-all-btn">View All</button>
          </div>

          <div className="charts-grid">
            {hotPlaylists
              .filter(p => !p.isEmpty)
              .slice(0, 3)
              .map((playlist) => (
                <div key={playlist._id} className="chart-card">
                  <div className="chart-cover">
                    {playlist.coverImage ? (
                      <img src={playlist.coverImage} alt={playlist.name} />
                    ) : (
                      '🎵'
                    )}
                  </div>
                  <div className="chart-info">
                    <h4>{playlist.name}</h4>
                    <p>{playlist.genre || 'Various'}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MainContent;