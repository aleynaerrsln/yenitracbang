// src/components/layout/RightPanel.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiMoreVertical } from 'react-icons/fi';
import { musicAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import TrackOptionsModal from '../modals/TrackOptionsModal';
import SelectArtistModal from '../modals/SelectArtistModal';
import './RightPanel.css';

const RightPanel = ({ onWidthChange }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [top10Tracks, setTop10Tracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  // Modal states
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showTrackOptions, setShowTrackOptions] = useState(false);
  const [showSelectArtist, setShowSelectArtist] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

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

  const handleOpenOptions = (track, e) => {
    e.stopPropagation();

    const buttonRect = e.currentTarget.getBoundingClientRect();
    // Menüyü SOLA açmak için left pozisyonunu butonun soluna ayarla
    setMenuPosition({
      top: buttonRect.top,
      left: buttonRect.left - 210 // Menü genişliği kadar sola kaydır
    });

    setSelectedTrack(track);
    setShowTrackOptions(true);
  };

  const handleViewArtists = () => {
    if (selectedTrack?.artists && selectedTrack.artists.length > 0) {
      setShowTrackOptions(false);
      setShowSelectArtist(true);
    } else {
      toast.error('No artists found for this track');
    }
  };

  const handleAddToPlaylist = () => {
    toast.info('Add to playlist feature coming soon');
  };

  const handleShare = () => {
    toast.info('Share feature coming soon');
  };

  const handleArtistsClick = (track, e) => {
    e.stopPropagation();

    if (!track.artists || track.artists.length === 0) {
      toast.error('No artists found');
      return;
    }

    // Tek sanatçı varsa direkt git
    if (track.artists.length === 1) {
      const artist = track.artists[0];
      navigate(`/artist/${artist.slug || artist._id}`);
    } else {
      // Birden fazla sanatçı varsa modal aç - SOLA açılsın
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.left - 230 // Menü genişliği kadar sola kaydır
      });
      setSelectedTrack(track);
      setShowSelectArtist(true);
    }
  };

  const handleTrackClick = (track) => {
    // Şarkıya tıklandığında yapılacak işlem (şarkıyı çal, detay sayfasına git vb.)
    toast.info(`Playing: ${track.title}`);
    // navigate(`/track/${track._id}`); // Eğer track detay sayfası varsa
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
              <div
                key={track._id}
                className="trending-item"
                onClick={() => handleTrackClick(track)}
              >
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
                  <button
                    className="trending-artists-btn"
                    onClick={(e) => handleArtistsClick(track, e)}
                    title="View artists"
                    ref={(el) => {
                      if (el) {
                        const textSpan = el.querySelector('.artist-text');
                        if (textSpan && el.scrollWidth > el.clientWidth) {
                          el.classList.add('marquee-active');
                          textSpan.setAttribute('data-text', textSpan.textContent);
                        }
                      }
                    }}
                  >
                    <span className="artist-text">
                      {track.artists?.map(a => a.name).join(', ') || track.artistNames || 'Unknown'}
                    </span>
                  </button>
                </div>

                <div className="trending-badge">
                  {track.likes || 0}
                </div>

                <button
                  className="trending-options-btn"
                  onClick={(e) => handleOpenOptions(track, e)}
                  title="More options"
                >
                  <FiMoreVertical size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Track Options Modal */}
      <TrackOptionsModal
        isOpen={showTrackOptions}
        onClose={() => setShowTrackOptions(false)}
        onViewArtists={handleViewArtists}
        onAddToPlaylist={handleAddToPlaylist}
        onShare={handleShare}
        position={menuPosition}
      />

      {/* Select Artist Modal */}
      <SelectArtistModal
        isOpen={showSelectArtist}
        onClose={() => setShowSelectArtist(false)}
        artists={selectedTrack?.artists || []}
        trackInfo={selectedTrack ? {
          title: selectedTrack.title,
          imageUrl: selectedTrack.imageUrl
        } : null}
        position={menuPosition}
      />
    </div>
  );
};

export default RightPanel;