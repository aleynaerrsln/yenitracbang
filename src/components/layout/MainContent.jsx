// src/components/layout/MainContent.jsx - MİNİMALİST HEADER
import { useState, useEffect, useRef } from 'react';
import { genreAPI, hotAPI } from '../../services/api';
import GenreCard from '../common/GenreCard';
import PlaylistCard from '../common/PlaylistCard';
import HotCard from '../common/HotCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './MainContent.css';

const MainContent = () => {
  const [genres, setGenres] = useState([]);
  const [hotPlaylists, setHotPlaylists] = useState([]);
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
      </div>
    </div>
  );
};

export default MainContent;