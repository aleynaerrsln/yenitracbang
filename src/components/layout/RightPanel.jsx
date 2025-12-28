// src/components/layout/RightPanel.jsx
import { useState, useEffect, useRef } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { musicAPI } from '../../services/api';
import './RightPanel.css';

const RightPanel = ({ onWidthChange }) => {
  const [top10Tracks, setTop10Tracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !panelRef.current) return;

      const panelRect = panelRef.current.getBoundingClientRect();
      const newWidth = panelRect.right - e.clientX;

      if (newWidth >= 280 && newWidth <= 600) {
        setPanelWidth(newWidth);
        if (onWidthChange) {
          onWidthChange(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // API çağrısı
      const top10Res = await musicAPI.getGlobalTop10();

      // Global Top 10 tracks - tüm kategorileri birleştir
      if (top10Res.data.success) {
        const top10Data = top10Res.data.data?.top10 || {};

        // Tüm kategorilerdeki şarkıları tek array'e çevir
        const allTracks = [];
        Object.values(top10Data).forEach(categoryTracks => {
          if (Array.isArray(categoryTracks)) {
            allTracks.push(...categoryTracks);
          }
        });

        // Beğeni sayısına göre sırala ve ilk 10'u al
        const sortedTracks = allTracks
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 10);

        setTop10Tracks(sortedTracks);
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
    <div
      ref={panelRef}
      className="right-panel"
      style={{ width: `${panelWidth}px` }}
    >
      {/* Resize Handle */}
      <div
        className="resize-handle-right"
        onMouseDown={handleResizeStart}
      />

      {/* Top 10 Global */}
      <section className="panel-section">
        <div className="section-header">
          <h3>Top 10 Tracks</h3>
          <FiTrendingUp style={{ color: '#1ed760', fontSize: '1.2rem' }} />
        </div>

        <div className="trending-list">
          {top10Tracks.length === 0 ? (
            <p className="empty-message">No tracks available</p>
          ) : (
            top10Tracks.map((track, index) => (
              <div key={track._id} className="trending-item">
                <div className="trending-rank">#{index + 1}</div>

                <div className="track-cover">
                  {track.imageUrl ? (
                    <img src={track.imageUrl} alt={track.title} />
                  ) : (
                    <div className="cover-placeholder">🎵</div>
                  )}
                </div>

                <div className="trending-info">
                  <h4>{track.title}</h4>
                  <p>{track.artists?.map(a => a.name).join(', ') || track.artistNames || 'Unknown'}</p>
                </div>

                <div className="trending-badge">
                  {track.likes || 0}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default RightPanel;