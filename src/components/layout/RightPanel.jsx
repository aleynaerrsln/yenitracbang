// src/components/layout/RightPanel.jsx
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiMusic } from 'react-icons/fi';
import { genreAPI, hotAPI } from '../../services/api';
import './RightPanel.css';

const RightPanel = () => {
  const [relatedMusic, setRelatedMusic] = useState([]);
  const [trending, setTrending] = useState([]);
  const [djCharts, setDjCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Paralel API çağrıları
      const [genresRes, hotRes] = await Promise.all([
        genreAPI.getAllGenres(),
        hotAPI.getHotPlaylists()
      ]);

      // Genres'ten trending oluştur
      if (genresRes.data.success) {
        const genres = genresRes.data.genres || [];
        const trendingData = genres.slice(0, 3).map((genre, index) => ({
          id: genre._id,
          name: genre.name,
          count: `${Math.floor(Math.random() * 10) + 1} tracks`, // Backend'de track count yoksa random
          trend: `+${12 - (index * 2)}%`
        }));
        setTrending(trendingData);
      }

      // Hot playlists'ten related music ve DJ charts oluştur
      if (hotRes.data.success) {
        const playlists = hotRes.data.hotPlaylists || [];
        
        // Related Music (ilk 2 playlist)
        const relatedData = playlists.slice(0, 2).map((playlist) => ({
          id: playlist._id,
          title: playlist.name,
          artist: playlist.genre || 'Various',
          cover: playlist.coverImage || '🎵',
          isPlaying: false,
        }));
        setRelatedMusic(relatedData);

        // DJ Charts (3 playlist)
        const chartsData = playlists.slice(0, 3).map((playlist) => ({
          id: playlist._id,
          name: playlist.userId?.username || 'DJ',
          chart: playlist.name,
        }));
        setDjCharts(chartsData);
      }

    } catch (error) {
      console.error('RightPanel data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="right-panel">
        <div className="panel-section">
          <h3 className="panel-title">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel">
      {/* İlgili Müzik Videoları */}
      <section className="panel-section">
        <h3 className="panel-title">İlgili müzik videoları</h3>
        
        <div className="related-music-list">
          {relatedMusic.length === 0 ? (
            <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>No music available</p>
          ) : (
            relatedMusic.map((music) => (
              <div key={music.id} className="related-music-item">
                <div className="music-cover">
                  {music.cover.startsWith('http') ? (
                    <img src={music.cover} alt={music.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    music.cover
                  )}
                </div>
                <div className="music-info">
                  <h4>{music.title}</h4>
                  <p>{music.artist}</p>
                </div>
                <button className="btn-play-small">
                  ▶️
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="panel-section">
        <div className="section-header-small">
          <h3 className="panel-title">Trending Now</h3>
          <FiTrendingUp className="trend-icon" />
        </div>

        <div className="trending-list">
          {trending.length === 0 ? (
            <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>No trending data</p>
          ) : (
            trending.map((item, index) => (
              <div key={item.id} className="trending-item">
                <div className="trending-rank">#{index + 1}</div>
                <div className="trending-info">
                  <h4>{item.name}</h4>
                  <p>{item.count}</p>
                </div>
                <div className="trending-badge">
                  {item.trend}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* DJ Charts Preview */}
      <section className="panel-section">
        <h3 className="panel-title">Popular DJ Charts</h3>
        
        <div className="dj-charts-preview">
          {djCharts.length === 0 ? (
            <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>No DJ charts available</p>
          ) : (
            djCharts.map((dj) => (
              <div key={dj.id} className="dj-chart-mini">
                <div className="dj-avatar">
                  <FiMusic />
                </div>
                <div className="dj-info">
                  <h4>{dj.name}</h4>
                  <p>{dj.chart}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* New Releases Badge */}
      <div className="new-releases-banner">
        <div className="banner-icon">✨</div>
        <div className="banner-text">
          <h4>New Releases</h4>
          <p>Fresh tracks every week</p>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;