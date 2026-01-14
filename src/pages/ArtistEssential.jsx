// src/pages/ArtistEssential.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddMusicModal from '../components/modals/AddMusicModal';
import TrackOptionsModal from '../components/modals/TrackOptionsModal';
import SelectArtistModal from '../components/modals/SelectArtistModal';
import { artistMusicAPI, musicAPI } from '../services/api';
import './ArtistEssential.css';
import { toast } from 'react-hot-toast';
import { FiHeart, FiMoreVertical } from 'react-icons/fi';



const ArtistEssential = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myMusic, setMyMusic] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('music'); // 'music' or 'playlists'

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Track options modal state
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [optionsModalPosition, setOptionsModalPosition] = useState({ top: 0, left: 0 });
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Artist selection modal state
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [artistModalPosition, setArtistModalPosition] = useState({ top: 0, left: 0 });

  // Debug: Kullanıcı bilgisini konsola yazdır
  console.log('ArtistEssential - User data:', user);
  console.log('isVerifiedArtist:', user?.isVerifiedArtist);
  console.log('badge:', user?.badge);

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/trackbangofficial', '_blank');
  };

  // Rozetli kullanıcılar için tam içerik
  // Badge'i olan herkes (standard, premium, trackbang) VEYA isVerifiedArtist: true
  const hasAccess = user?.isVerifiedArtist === true ||
                    (user?.badge && user.badge !== 'none');

  // Kullanıcının müziklerini çek
  useEffect(() => {
    if (hasAccess) {
      fetchMyMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess]);

  const fetchMyMusic = async () => {
    try {
      setLoading(true);
      // Tüm müzikleri çek
      const response = await artistMusicAPI.getUserMusic({});
      console.log('My music response:', response.data);

      const allMusic = response.data.musics || response.data.data?.musics || [];

      // localStorage'dan kullanıcının eklediği şarkı ID'lerini al
      const myMusicIds = JSON.parse(localStorage.getItem('myMusicIds') || '[]');

      console.log('📊 Debug Info:');
      console.log('Total music count:', allMusic.length);
      console.log('My music IDs from localStorage:', myMusicIds);
      console.log('Current user ID:', user?._id);

      // Sadece kullanıcının eklediği şarkıları filtrele
      const filteredMusic = allMusic.filter(music => myMusicIds.includes(music._id));

      console.log('✅ Filtered music count:', filteredMusic.length);
      console.log('Filtered music:', filteredMusic.map(m => ({
        id: m._id,
        title: m.title,
        artist: m.artistNames
      })));

      setMyMusic(filteredMusic);
    } catch (error) {
      console.error('Failed to fetch music:', error);
      setMyMusic([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

const handleSaveMusic = async (musicData) => {
  try {
    console.log('💾 Saving music:', musicData);

    const response = await artistMusicAPI.addMusic(musicData);

    // Eklenen şarkının ID'sini localStorage'a kaydet
    const addedMusicId = response.data.data?.music?._id || response.data.music?._id;
    if (addedMusicId) {
      const myMusicIds = JSON.parse(localStorage.getItem('myMusicIds') || '[]');
      myMusicIds.push(addedMusicId);
      localStorage.setItem('myMusicIds', JSON.stringify(myMusicIds));
      console.log('✅ Şarkı ID localStorage\'a kaydedildi:', addedMusicId);
    }

    toast.success("Şarkı eklendi!");
    setIsModalOpen(false);
    fetchMyMusic();
  } catch (error) {
    console.error('❌ Failed to save music:', error);
    toast.error(error.response?.data?.message || 'Şarkı eklenirken hata oluştu');
  }
};

  // Like music handler
  const handleLikeMusic = async (musicId, e) => {
    e.stopPropagation();
    try {
      await musicAPI.likeMusic(musicId);

      // Update local state
      setMyMusic(prev =>
        prev.map(m =>
          m._id === musicId
            ? { ...m, isLiked: !m.isLiked, likes: m.isLiked ? (m.likes || 1) - 1 : (m.likes || 0) + 1 }
            : m
        )
      );

      toast.success(myMusic.find(m => m._id === musicId)?.isLiked ? 'Beğeni kaldırıldı' : 'Beğenildi');
    } catch (error) {
      console.error('Like error:', error);
      toast.error('İşlem başarısız');
    }
  };

  // Options button click handler
  const handleOptionsClick = (music, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setOptionsModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });

    setSelectedTrack(music);
    setOptionsModalOpen(true);
  };

  // Open artist selection modal
  const handleViewArtists = () => {
    if (!selectedTrack) return;

    // Sanatçı modalini options dropdown'ın tam yerinde aç
    setArtistModalPosition({
      top: optionsModalPosition.top,
      left: optionsModalPosition.left
    });

    setOptionsModalOpen(false);
    setArtistModalOpen(true);
  };


  // Filter music based on search query
  const filteredMusic = myMusic.filter(music => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      music.title?.toLowerCase().includes(query) ||
      music.artistNames?.toLowerCase().includes(query) ||
      music.genre?.toLowerCase().includes(query)
    );
  });

  if (hasAccess) {
    return (
      <div className="artist-essential-page verified">
        <div className="mobile-artist-content">
          {/* Top Tabs */}
          <div className="top-tabs">
            <button
              className={`tab-button ${activeTab === 'music' ? 'active' : ''}`}
              onClick={() => setActiveTab('music')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              My Music
            </button>
            <button
              className={`tab-button ${activeTab === 'playlists' ? 'active' : ''}`}
              onClick={() => setActiveTab('playlists')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3l-1.1 3.3H7l2.9 2.1-1.1 3.4L12 9.7l3.2 2.1-1.1-3.4L17 6.3h-3.9L12 3zm0 3.9l.6 1.8h1.9l-1.5 1.1.6 1.8L12 11.1l-1.5 1.1.6-1.8-1.5-1.1h1.9l.6-1.8z"/>
              </svg>
              My Playlists
            </button>
          </div>

          {/* Search Bar */}
          <div className="artist-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search your music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Music Button */}
          <button className="add-music-btn" onClick={() => setIsModalOpen(true)}>
            <div className="plus-circle">+</div>
            <span>Add Music</span>
          </button>

          {/* Music List or Empty State */}
          {activeTab === 'music' ? (
            loading ? (
              <div className="empty-music-state">
                <p>Loading...</p>
              </div>
            ) : myMusic.length === 0 ? (
              <div className="empty-music-state">
                <div className="music-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <h3 className="empty-title">No music yet</h3>
                <p className="empty-subtitle">Add your first track</p>
              </div>
            ) : filteredMusic.length === 0 ? (
              <div className="empty-music-state">
                <div className="music-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <h3 className="empty-title">No results found</h3>
                <p className="empty-subtitle">Try a different search term</p>
              </div>
            ) : (
              <div className="music-list">
                {filteredMusic.map((music) => (
                <div key={music._id} className="music-item">
                  <img src={music.imageUrl} alt={music.title} className="music-cover" />
                  <div className="music-info">
                    <h4 className="music-title">{music.title}</h4>
                    <p className="music-artist">{music.artistNames}</p>
                    <div className="music-genres">
                      {music.genre && (
                        <span className="genre-tag">{music.genre}</span>
                      )}
                    </div>
                  </div>
                  <div className="music-actions">
                    <a href={music.platformLinks?.spotify} target="_blank" rel="noopener noreferrer" className="platform-link">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                    {music.platformLinks?.appleMusic && (
                      <a href={music.platformLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="platform-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FA243C">
                          <path d="M23.994 6.124c0-.738-.034-1.47-.098-2.198-.065-.765-.171-1.531-.396-2.269-.25-.871-.663-1.654-1.227-2.315-.565-.666-1.279-1.171-2.081-1.523C19.470-.431 18.683-.64 17.884-.756c-.766-.112-1.538-.167-2.308-.198C14.611-.989 13.645-1 12.696-1c-.949 0-1.915.011-2.88.046-.77.031-1.542.086-2.308.198-.799.116-1.586.325-2.308.576-.802.352-1.516.857-2.081 1.523C2.554.909 2.141 1.692 1.891 2.563c-.225.738-.331 1.504-.396 2.269C1.431 5.6 1.397 6.332 1.397 7.07 1.363 8.014 1.352 8.958 1.352 9.902c0 .944.011 1.888.045 2.832.034.738.068 1.47.098 2.198.065.765.171 1.531.396 2.269.25.871.663 1.654 1.227 2.315.565.666 1.279 1.171 2.081 1.523.722.251 1.509.46 2.308.576.766.112 1.538.167 2.308.198.965.035 1.931.046 2.88.046.949 0 1.915-.011 2.88-.046.77-.031 1.542-.086 2.308-.198.799-.116 1.586-.325 2.308-.576.802-.352 1.516-.857 2.081-1.523.564-.661.977-1.444 1.227-2.315.225-.738.331-1.504.396-2.269.03-.728.064-1.46.098-2.198.034-.944.045-1.888.045-2.832 0-.944-.011-1.888-.045-2.832zm-3.568 9.347c-.033.694-.125 1.383-.3 2.056-.192.722-.478 1.396-.93 1.968-.456.577-1.048.998-1.735 1.232-.684.235-1.402.334-2.122.401-.721.067-1.443.102-2.165.118-.95.022-1.9.034-2.851.034-.951 0-1.901-.012-2.851-.034-.722-.016-1.444-.051-2.165-.118-.72-.067-1.438-.166-2.122-.401-.687-.234-1.279-.655-1.735-1.232-.452-.572-.738-1.246-.93-1.968-.175-.673-.267-1.362-.3-2.056-.036-.721-.053-1.443-.071-2.165-.024-.95-.036-1.9-.036-2.851 0-.951.012-1.901.036-2.851.018-.722.035-1.444.071-2.165.033-.694.125-1.383.3-2.056.192-.722.478-1.396.93-1.968.456-.577 1.048-.998 1.735-1.232.684-.235 1.402-.334 2.122-.401.721-.067 1.443-.102 2.165-.118.95-.022 1.9-.034 2.851-.034.951 0 1.901.012 2.851.034.722.016 1.444.051 2.165.118.72.067 1.438.166 2.122.401.687.234 1.279.655 1.735 1.232.452.572.738 1.246.93 1.968.175.673.267 1.362.3 2.056.036.721.053 1.443.071 2.165.024.95.036 1.9.036 2.851 0 .951-.012 1.901-.036 2.851-.018.722-.035 1.444-.071 2.165zm-7.945-4.378c-.011-.906-.227-1.793-.648-2.588-.419-.793-1.022-1.476-1.755-1.986-.732-.508-1.579-.83-2.465-.933-.884-.102-1.779-.032-2.646.205-.866.236-1.684.65-2.373 1.24-.689.589-1.229 1.337-1.567 2.182-.337.844-.471 1.764-.389 2.678.083.914.368 1.801.831 2.577.463.776 1.097 1.421 1.846 1.878.748.457 1.592.712 2.46.743.867.031 1.738-.129 2.54-.467.802-.338 1.515-.859 2.08-1.517.564-.658.964-1.435 1.165-2.268.201-.833.227-1.698.095-2.534l-.174-.21z"/>
                        </svg>
                      </a>
                    )}
                    <button
                      className="music-like-btn"
                      onClick={(e) => handleLikeMusic(music._id, e)}
                    >
                      <FiHeart
                        size={20}
                        fill={music.isLiked ? '#FF6B6B' : 'none'}
                        color={music.isLiked ? '#FF6B6B' : 'rgba(255,255,255,0.6)'}
                      />
                      <span className="like-count">{music.likes || 0}</span>
                    </button>
                    <button
                      className="music-options-btn"
                      onClick={(e) => handleOptionsClick(music, e)}
                    >
                      <FiMoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )
          ) : (
            <div className="empty-music-state">
              <div className="music-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3l-1.1 3.3H7l2.9 2.1-1.1 3.4L12 9.7l3.2 2.1-1.1-3.4L17 6.3h-3.9L12 3zm0 3.9l.6 1.8h1.9l-1.5 1.1.6 1.8L12 11.1l-1.5 1.1.6-1.8-1.5-1.1h1.9l.6-1.8z"/>
                </svg>
              </div>
              <h3 className="empty-title">My Playlists</h3>
              <p className="empty-subtitle">Playlist feature coming soon</p>
            </div>
          )}
        </div>

        {/* Add Music Modal */}
        <AddMusicModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMusic}
        />

        {/* Track Options Modal */}
        <TrackOptionsModal
          isOpen={optionsModalOpen}
          onClose={() => setOptionsModalOpen(false)}
          position={optionsModalPosition}
          trackInfo={selectedTrack}
          onViewArtists={handleViewArtists}
        />

        {/* Select Artist Modal */}
        <SelectArtistModal
          isOpen={artistModalOpen}
          onClose={() => setArtistModalOpen(false)}
          position={artistModalPosition}
          artists={selectedTrack?.artists || []}
          trackInfo={selectedTrack}
        />

      </div>
    );
  }

  // Rozetsiz kullanıcılar için kilit ekranı
  return (
    <div className="artist-essential-page">
      <div className="lock-container">
        <div className="lock-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
          </svg>
        </div>

        <h2 className="lock-title">Bu özelliğe erişmek için</h2>
        <p className="lock-subtitle">Instagram üzerinden iletişime geçin</p>

        <button className="instagram-button" onClick={handleInstagramClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Instagram
        </button>
      </div>
    </div>
  );
};

export default ArtistEssential;
