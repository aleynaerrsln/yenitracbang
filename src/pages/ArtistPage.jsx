// src/pages/ArtistPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artistAPI, musicAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiArrowLeft, FiPlay, FiHeart, FiMoreVertical } from 'react-icons/fi';
import './ArtistPage.css';

const ArtistPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [artist, setArtist] = useState(null);
  const [artistMusic, setArtistMusic] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArtistData();
    }
  }, [slug]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);

      // Sanatçı bilgilerini çek
      const artistResponse = await artistAPI.getArtistBySlug(slug);
      const responseData = artistResponse.data.data;

      // Backend response'da artist nested objesi olabilir
      const artistData = responseData.artist || responseData;

      console.log('🎨 Artist data from backend:', artistData);
      console.log('🖼️ Profile image:', artistData?.profileImage);
      setArtist(artistData);

      // Sanatçının şarkılarını çek
      const musicResponse = await musicAPI.getMusicByArtistSlug(slug);
      const allMusics = musicResponse.data.data?.musics || [];

      // Debug: Tüm şarkıları göster
      console.log('🎵 All musics:', allMusics.map(m => ({
        id: m._id,
        title: m.title,
        artist: m.artistNames
      })));

      // Duplicate şarkıları filtrele (aynı _id'ye sahip olanlar)
      const uniqueMusics = allMusics.filter((music, index, self) =>
        index === self.findIndex((m) => m._id === music._id)
      );

      console.log('🎵 Total musics:', allMusics.length);
      console.log('🎵 Unique musics:', uniqueMusics.length);

      setArtistMusic(uniqueMusics);

      // Popular tracks (en çok beğenilenleri al)
      const sortedByLikes = [...uniqueMusics].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      setPopularTracks(sortedByLikes.slice(0, 5));

      // Takip durumunu kontrol et
      setIsFollowing(artistData?.isFollowing || false);

    } catch (error) {
      console.error('Failed to fetch artist:', error);
      toast.error('Sanatçı bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!artist) return;

    try {
      if (isFollowing) {
        await artistAPI.unfollowArtist(artist._id);
        setIsFollowing(false);
        setArtist(prev => ({
          ...prev,
          followersCount: (prev.followersCount || 0) - 1
        }));
        toast.success('Takipten çıkıldı');
      } else {
        await artistAPI.followArtist(artist._id);
        setIsFollowing(true);
        setArtist(prev => ({
          ...prev,
          followersCount: (prev.followersCount || 0) + 1
        }));
        toast.success('Takip edildi');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('İşlem başarısız');
    }
  };

  const handlePlayMusic = (music) => {
    console.log('Playing:', music.title);
    toast.info('Play özelliği yakında eklenecek');
  };

  const handleSpotifyClick = (music, e) => {
    e.stopPropagation();

    // platformLinks içinden Spotify linkini al
    const spotifyUrl = music.platformLinks?.spotify || music.spotifyUrl;

    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank');
    } else {
      toast.error('Spotify linki bulunamadı');
    }
  };

  const handleBeatportClick = (music, e) => {
    e.stopPropagation();

    // platformLinks içinden Beatport linkini al
    const beatportUrl = music.platformLinks?.beatport || music.beatportUrl;

    if (beatportUrl) {
      window.open(beatportUrl, '_blank');
    } else {
      toast.error('Beatport linki bulunamadı');
    }
  };

  const handleLikeMusic = async (musicId) => {
    try {
      await musicAPI.likeMusic(musicId);

      // Listeyi güncelle
      setArtistMusic(prev =>
        prev.map(m =>
          m._id === musicId
            ? { ...m, isLiked: !m.isLiked, likes: m.isLiked ? m.likes - 1 : m.likes + 1 }
            : m
        )
      );
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Beğeni işlemi başarısız');
    }
  };

  if (loading) {
    return (
      <div className="artist-page loading">
        <div className="artist-header-skeleton"></div>
        <div className="artist-tracks-skeleton"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="artist-page not-found">
        <h2>Sanatçı bulunamadı</h2>
        <button onClick={() => navigate(-1)}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="artist-page">
      {/* Header with Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft size={24} />
      </button>

      {/* Artist Header */}
      <div className="artist-header">
        <div className="artist-profile-section">
          <div className="artist-avatar">
            {(artist.profileImage || artist.image || artist.imageUrl || artist.avatar) ? (
              <img src={artist.profileImage || artist.image || artist.imageUrl || artist.avatar} alt={artist.name} />
            ) : (
              <div className="avatar-placeholder">
                {artist.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="artist-main-info">
            <div className="artist-name-row">
              <h1 className="artist-name">{artist.name}</h1>
              <button
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
            <p className="artist-followers">{artist.followersCount || 0} followers</p>
            {artist.bio && (
              <div className="artist-bio-section">
                <p className={`artist-bio ${showFullBio ? 'expanded' : 'collapsed'}`}>
                  {artist.bio}
                </p>
                {artist.bio.length > 100 && (
                  <button
                    className="read-more-btn"
                    onClick={() => setShowFullBio(!showFullBio)}
                  >
                    {showFullBio ? 'Daha az göster' : 'Daha fazla oku'}
                  </button>
                )}
              </div>
            )}

            {/* Artist Stats */}
            <div className="artist-stats-row">
              <div className="stat-item">
                <span className="stat-value">{artist.bangasCount || 0}</span>
                <span className="stat-label">Bangas</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{artistMusic.length}</span>
                <span className="stat-label">Tracks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{artist.followersCount || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tracks Section */}
      {popularTracks.length > 0 && (
        <div className="tracks-section">
          <h2 className="section-title">Popular Tracks</h2>
          <div className="tracks-grid">
            {popularTracks.map((music) => (
              <div key={music._id} className="track-card">
                <div className="track-card-image">
                  <img src={music.imageUrl} alt={music.title} />
                  <button className="track-play-overlay" onClick={() => handlePlayMusic(music)}>
                    <FiPlay size={20} />
                  </button>
                </div>
                <div className="track-card-info">
                  <h4 className="track-card-title">{music.title}</h4>
                  <p className="track-card-artist">{music.artistNames || artist.name}</p>
                </div>
                <div className="track-card-right">
                  <button className="spotify-btn" onClick={(e) => handleSpotifyClick(music, e)}>
                    <span className="spotify-icon">♫</span>
                    Spotify
                  </button>
                  <button className="beatport-btn" onClick={(e) => handleBeatportClick(music, e)}>
                    <span className="beatport-icon">↗</span>
                    Beatport
                  </button>
                  <button className="track-like-btn" onClick={() => handleLikeMusic(music._id)}>
                    <FiHeart size={20} fill={music.isLiked ? '#FF6B6B' : 'none'} color={music.isLiked ? '#FF6B6B' : '#fff'} />
                    <span className="like-count">{music.likes || 0}</span>
                  </button>
                  <button className="track-options-btn">
                    <FiMoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tracks Section */}
      <div className="tracks-section">
        <h2 className="section-title">All Tracks <span className="track-count">{artistMusic.length} tracks</span></h2>

        {artistMusic.length === 0 ? (
          <p className="no-tracks">Henüz şarkı eklenmemiş</p>
        ) : (
          <div className="tracks-grid">
            {artistMusic.map((music) => (
              <div key={music._id} className="track-card">
                <div className="track-card-image">
                  <img src={music.imageUrl} alt={music.title} />
                  <button className="track-play-overlay" onClick={() => handlePlayMusic(music)}>
                    <FiPlay size={20} />
                  </button>
                </div>
                <div className="track-card-info">
                  <h4 className="track-card-title">{music.title}</h4>
                  <p className="track-card-artist">{music.artistNames || artist.name}</p>
                </div>
                <div className="track-card-right">
                  <button className="spotify-btn" onClick={(e) => handleSpotifyClick(music, e)}>
                    <span className="spotify-icon">♫</span>
                    Spotify
                  </button>
                  <button className="beatport-btn" onClick={(e) => handleBeatportClick(music, e)}>
                    <span className="beatport-icon">↗</span>
                    Beatport
                  </button>
                  <button className="track-like-btn" onClick={() => handleLikeMusic(music._id)}>
                    <FiHeart size={20} fill={music.isLiked ? '#FF6B6B' : 'none'} color={music.isLiked ? '#FF6B6B' : '#fff'} />
                    <span className="like-count">{music.likes || 0}</span>
                  </button>
                  <button className="track-options-btn">
                    <FiMoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;
