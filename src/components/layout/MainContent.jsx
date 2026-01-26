// src/components/layout/MainContent.jsx - MİNİMALİST HEADER + MOBİL TOP 10
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { genreAPI, hotAPI, musicAPI } from '../../services/api';
import GenreCard from '../common/GenreCard';
import PlaylistCard from '../common/PlaylistCard';
import HotCard from '../common/HotCard';
import { FiChevronLeft, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import './MainContent.css';

const MainContent = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [hotPlaylists, setHotPlaylists] = useState([]);
  const [top10Tracks, setTop10Tracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const genresScrollRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [genresRes, hotRes, top10Res] = await Promise.all([
        genreAPI.getAllGenres(),
        hotAPI.getHotPlaylists(),
        musicAPI.getGlobalTop10()
      ]);

      console.log('Genres Response:', genresRes);
      console.log('Hot Response:', hotRes);

      if (genresRes.data.success) {
        setGenres(genresRes.data.data || []);
      }

      if (hotRes.data.success) {
        setHotPlaylists(hotRes.data.hotPlaylists || []);
      }

      // Top 10 Tracks
      if (top10Res.data.success) {
        const top10Data = top10Res.data.data?.top10 || {};
        const allTracks = [];
        Object.values(top10Data).forEach(categoryTracks => {
          if (Array.isArray(categoryTracks)) {
            allTracks.push(...categoryTracks);
          }
        });
        const sortedTracks = allTracks
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 10);
        setTop10Tracks(sortedTracks);
      }

    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = (artist) => {
    navigate(`/artist/${artist.slug || artist._id}`);
  };

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    const container = genresScrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll handlers
  const scrollLeft = () => {
    genresScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRight = () => {
    genresScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' });
  };

  // Check arrows when genres load or window resizes
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [genres]);

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
            <div className="genres-scroll-container">
              {showLeftArrow && (
                <button className="scroll-arrow scroll-arrow-left" onClick={scrollLeft}>
                  <FiChevronLeft size={24} />
                </button>
              )}

              <div
                className="genres-grid-scroll"
                ref={genresScrollRef}
                onScroll={checkScrollPosition}
              >
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

              {showRightArrow && (
                <button className="scroll-arrow scroll-arrow-right" onClick={scrollRight}>
                  <FiChevronRight size={24} />
                </button>
              )}
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
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="hot-grid">
              {hotPlaylists
                .filter(p => !p.isEmpty)
                .slice(0, 6)
                .map((playlist) => (
                  <HotCard
                    key={playlist._id}
                    playlist={playlist}
                    onLike={(id) => console.log('Liked playlist:', id)}
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

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="hot-grid">
              {hotPlaylists
                .filter(p => !p.isEmpty)
                .slice(0, 3)
                .map((playlist) => (
                  <HotCard
                    key={playlist._id}
                    playlist={playlist}
                    onLike={(id) => console.log('Liked playlist:', id)}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Top 10 Tracks Section - Mobile Only */}
        <section className="content-section mobile-top10-section">
          <div className="section-header">
            <h2 className="section-title">
              Top 10 Tracks
              <FiTrendingUp className="trending-icon-title" />
            </h2>
            <button className="view-all-btn" onClick={() => navigate('/top10')}>
              View All
            </button>
          </div>

          {loading ? (
            <div className="top10-loading">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="top10-skeleton" />
              ))}
            </div>
          ) : (
            <div className="mobile-top10-list">
              {top10Tracks.length === 0 ? (
                <p className="empty-message">No tracks available</p>
              ) : (
                top10Tracks.map((track, index) => (
                  <div key={track._id} className="mobile-top10-item">
                    <div className="top10-rank">#{index + 1}</div>

                    <div className="top10-cover">
                      {track.imageUrl ? (
                        <img src={track.imageUrl} alt={track.title} />
                      ) : (
                        <div className="top10-cover-placeholder">🎵</div>
                      )}
                    </div>

                    <div className="top10-info">
                      <h4 className="top10-title">{track.title}</h4>
                      <button
                        className="top10-artists"
                        onClick={() => {
                          if (track.artists?.length === 1) {
                            handleArtistClick(track.artists[0]);
                          }
                        }}
                      >
                        {track.artists?.map(a => a.name).join(', ') || track.artistNames || 'Unknown'}
                      </button>
                    </div>

                    <div className="top10-likes">
                      {track.likes || 0}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MainContent;