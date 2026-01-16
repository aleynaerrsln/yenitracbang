// src/pages/Top10Page.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiHeart, FiPlay, FiMoreVertical } from 'react-icons/fi';
import TrackOptionsModal from '../components/modals/TrackOptionsModal';
import SelectArtistModal from '../components/modals/SelectArtistModal';
import './Top10Page.css';

const Top10Page = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeGenre, setActiveGenre] = useState('all');
  const [top10Data, setTop10Data] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showTrackOptions, setShowTrackOptions] = useState(false);
  const [showSelectArtist, setShowSelectArtist] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

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

      // RightPanel'deki Top 10'u güncellemesi için event dispatch et
      window.dispatchEvent(new CustomEvent('top10Updated'));

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

  const handleOpenOptions = (music, e) => {
    e.stopPropagation();

    // 3 nokta butonunun pozisyonunu al
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: buttonRect.top,
      left: buttonRect.left
    });

    setSelectedTrack(music);
    setShowTrackOptions(true);
  };

  const handleViewArtists = () => {
    if (selectedTrack?.artists && selectedTrack.artists.length > 0) {
      // TrackOptionsModal'ı kapat, SelectArtistModal'ı aç (aynı pozisyonda)
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

  const handleArtistsClick = (music, e) => {
    e.stopPropagation();

    if (!music.artists || music.artists.length === 0) {
      toast.error('No artists found');
      return;
    }

    // Tek sanatçı varsa direkt git
    if (music.artists.length === 1) {
      const artist = music.artists[0];
      navigate(`/artist/${artist.slug || artist._id}`);
    } else {
      // Birden fazla sanatçı varsa modal aç
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.left
      });
      setSelectedTrack(music);
      setShowSelectArtist(true);
    }
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

              <button
                className="three-dot-menu"
                onClick={(e) => handleOpenOptions(music, e)}
              >
                <FiMoreVertical size={20} />
              </button>

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
                <button
                  className="music-artists clickable-artists"
                  onClick={(e) => handleArtistsClick(music, e)}
                  title="View artists"
                >
                  {music.artists?.map(a => a.name).join(', ') || music.artistNames || 'Unknown Artist'}
                </button>
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
        <p>En çok beğenilen şarkılar kategorilere göre</p>
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

export default Top10Page;
