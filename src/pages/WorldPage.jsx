// src/pages/WorldPage.jsx - Instagram Style Unified Feed

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistAPI, worldAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  FiHeart, FiMessageCircle, FiMusic,
  FiMapPin, FiClock, FiX, FiSend, FiChevronLeft,
  FiPlay
} from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import './WorldPage.css';

const WorldPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Unified feed state
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Pagination for each content type
  const [photosPage, setPhotosPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [playlistsPage, setPlaylistsPage] = useState(1);
  const [photosHasMore, setPhotosHasMore] = useState(true);
  const [eventsHasMore, setEventsHasMore] = useState(true);
  const [playlistsHasMore, setPlaylistsHasMore] = useState(true);

  // Image detail modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDetailLoading, setImageDetailLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Fetch all content and merge
  const fetchAllContent = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const currentPhotosPage = isLoadMore ? photosPage + 1 : 1;
      const currentEventsPage = isLoadMore ? eventsPage + 1 : 1;
      const currentPlaylistsPage = isLoadMore ? playlistsPage + 1 : 1;

      // Fetch all content types in parallel
      const [photosRes, eventsRes, playlistsRes] = await Promise.allSettled([
        photosHasMore || !isLoadMore ? worldAPI.getWorldPhotos({ page: currentPhotosPage, limit: 10 }) : Promise.resolve(null),
        eventsHasMore || !isLoadMore ? worldAPI.getWorldEvents({ page: currentEventsPage, limit: 10 }) : Promise.resolve(null),
        playlistsHasMore || !isLoadMore ? playlistAPI.getPublicWorldPlaylists({ page: currentPlaylistsPage, limit: 10 }) : Promise.resolve(null)
      ]);

      // Process photos
      let newPhotos = [];
      if (photosRes.status === 'fulfilled' && photosRes.value?.data?.success) {
        newPhotos = (photosRes.value.data.data?.photos || []).map(photo => ({
          ...photo,
          type: 'photo',
          sortDate: new Date(photo.createdAt || photo.uploadDate)
        }));
        const pagination = photosRes.value.data.data?.pagination;
        setPhotosHasMore(pagination?.page < pagination?.pages);
        setPhotosPage(currentPhotosPage);
      }

      // Process events
      let newEvents = [];
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.data?.success) {
        newEvents = (eventsRes.value.data.data?.events || []).map(event => ({
          ...event,
          type: 'event',
          sortDate: new Date(event.createdAt || event.date)
        }));
        const pagination = eventsRes.value.data.data?.pagination;
        setEventsHasMore(pagination?.page < pagination?.pages);
        setEventsPage(currentEventsPage);
      }

      // Process playlists
      let newPlaylists = [];
      if (playlistsRes.status === 'fulfilled' && playlistsRes.value?.data?.success) {
        newPlaylists = (playlistsRes.value.data.playlists || []).map(playlist => ({
          ...playlist,
          type: 'playlist',
          sortDate: new Date(playlist.createdAt),
          // Map resolvedOwner to owner for consistency
          owner: playlist.resolvedOwner || playlist.owner || playlist.userId
        }));
        const pagination = playlistsRes.value.data.pagination;
        setPlaylistsHasMore(pagination?.currentPage < pagination?.totalPages);
        setPlaylistsPage(currentPlaylistsPage);
      }

      // Merge and sort by date (newest first)
      const newContent = [...newPhotos, ...newEvents, ...newPlaylists]
        .sort((a, b) => b.sortDate - a.sortDate);

      if (isLoadMore) {
        setFeed(prev => [...prev, ...newContent]);
      } else {
        setFeed(newContent);
      }

      // Check if there's more content
      const stillHasMore = (photosRes.status === 'fulfilled' && photosRes.value?.data?.data?.pagination?.page < photosRes.value?.data?.data?.pagination?.pages) ||
        (eventsRes.status === 'fulfilled' && eventsRes.value?.data?.data?.pagination?.page < eventsRes.value?.data?.data?.pagination?.pages) ||
        (playlistsRes.status === 'fulfilled' && playlistsRes.value?.data?.pagination?.currentPage < playlistsRes.value?.data?.pagination?.totalPages);

      setHasMore(stillHasMore);

    } catch (error) {
      console.error('Fetch feed error:', error);
      if (!isLoadMore) {
        toast.error('İçerikler yüklenemedi');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [photosPage, eventsPage, playlistsPage, photosHasMore, eventsHasMore, playlistsHasMore, toast]);

  // Initial load
  useEffect(() => {
    fetchAllContent(false);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchAllContent(true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, fetchAllContent]);

  // Navigate to playlist
  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`, { state: { playlist } });
  };

  // Navigate to user profile
  const handleUserClick = (e, user) => {
    e.stopPropagation();
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });
    } catch {
      return '';
    }
  };

  // Open image detail
  const handleImageClick = async (photo) => {
    setSelectedImage({
      ...photo,
      isLiked: false,
      likeCount: photo.likes?.length || 0,
      comments: photo.comments || []
    });

    // Fetch full image details if user is logged in
    if (currentUser && photo.user?._id && photo._id) {
      setImageDetailLoading(true);
      try {
        const response = await worldAPI.getImageDetails(photo.user._id, photo._id);
        if (response.data.success) {
          setSelectedImage(prev => ({
            ...prev,
            ...response.data.image,
            owner: response.data.owner
          }));
        }
      } catch (error) {
        console.error('Get image details error:', error);
      } finally {
        setImageDetailLoading(false);
      }
    }
  };

  // Close image detail
  const closeImageDetail = () => {
    setSelectedImage(null);
    setCommentText('');
  };

  // Like image
  const handleLikeImage = async (e, photo) => {
    e?.stopPropagation();

    if (!currentUser) {
      toast.info('Beğenmek için giriş yapmalısınız');
      return;
    }

    const userId = photo.user?._id;
    const imageId = photo._id;

    if (!userId || !imageId) return;

    try {
      const response = await worldAPI.likeImage(userId, imageId);
      if (response.data.success) {
        // Update feed
        setFeed(prev => prev.map(item =>
          item._id === imageId && item.type === 'photo'
            ? { ...item, likes: response.data.liked ? [...(item.likes || []), currentUser._id] : (item.likes || []).filter(id => id !== currentUser._id) }
            : item
        ));

        // Update selected image if open
        if (selectedImage && selectedImage._id === imageId) {
          setSelectedImage(prev => ({
            ...prev,
            isLiked: response.data.liked,
            likeCount: response.data.likeCount
          }));
        }
      }
    } catch (error) {
      console.error('Like image error:', error);
      toast.error('Beğeni işlemi başarısız');
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.info('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    if (!commentText.trim() || !selectedImage) return;

    const userId = selectedImage.user?._id || selectedImage.owner?._id;
    const imageId = selectedImage._id;

    if (!userId || !imageId) return;

    setCommentSubmitting(true);
    try {
      const response = await worldAPI.commentImage(userId, imageId, commentText.trim());
      if (response.data.success) {
        setSelectedImage(prev => ({
          ...prev,
          comments: response.data.comments
        }));
        setCommentText('');

        // Update feed
        setFeed(prev => prev.map(item =>
          item._id === imageId && item.type === 'photo'
            ? { ...item, comments: response.data.comments }
            : item
        ));
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Yorum eklenemedi');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!selectedImage) return;

    const userId = selectedImage.user?._id || selectedImage.owner?._id;
    const imageId = selectedImage._id;

    try {
      const response = await worldAPI.deleteImageComment(userId, imageId, commentId);
      if (response.data.success) {
        setSelectedImage(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c._id !== commentId)
        }));

        // Update feed
        setFeed(prev => prev.map(item =>
          item._id === imageId && item.type === 'photo'
            ? { ...item, comments: (item.comments || []).filter(c => c._id !== commentId) }
            : item
        ));
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error('Yorum silinemedi');
    }
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="world-feed">
      {[1, 2, 3].map(i => (
        <div key={i} className="feed-post skeleton">
          <div className="post-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-text"></div>
          </div>
          <div className="skeleton-image"></div>
          <div className="post-actions">
            <div className="skeleton-icon"></div>
            <div className="skeleton-icon"></div>
            <div className="skeleton-icon"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render empty state
  const renderEmpty = () => (
    <div className="world-empty">
      <FiMusic size={64} />
      <h3>Henüz içerik yok</h3>
      <p>Kullanıcılar içerik paylaştığında burada görünecek</p>
    </div>
  );

  // Render photo post
  const renderPhotoPost = (photo) => {
    const isLiked = currentUser && photo.likes?.includes(currentUser._id);
    const user = photo.user;

    return (
      <article key={`photo-${photo._id}`} className="feed-post photo-post">
        {/* Post Header */}
        <header className="post-header" onClick={(e) => handleUserClick(e, user)}>
          <div className="post-user-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.username} />
            ) : (
              <div className="avatar-placeholder">
                {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="post-user-info">
            <span className="post-username">
              {user?.displayName || user?.username || 'Anonim'}
            </span>
            <span className="post-time">{formatDate(photo.createdAt || photo.uploadDate)}</span>
          </div>
        </header>

        {/* Post Content */}
        <div className="post-content" onClick={() => handleImageClick(photo)}>
          <div className="post-image-container">
            <img src={photo.url} alt="Post" className="post-image" />
          </div>
        </div>

        {/* Post Actions - Only like and comment */}
        <div className="post-actions">
          <div className="post-actions-left">
            <button
              className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={(e) => handleLikeImage(e, photo)}
            >
              <FiHeart size={24} />
            </button>
            <button
              className="action-btn comment-btn"
              onClick={() => handleImageClick(photo)}
            >
              <FiMessageCircle size={24} />
            </button>
          </div>
        </div>

        {/* Post Stats */}
        <div className="post-stats">
          {(photo.likes?.length > 0 || photo.comments?.length > 0) && (
            <span className="post-likes">
              {photo.likes?.length > 0 && `${photo.likes.length} beğeni`}
              {photo.likes?.length > 0 && photo.comments?.length > 0 && ' • '}
              {photo.comments?.length > 0 && `${photo.comments.length} yorum`}
            </span>
          )}
        </div>
      </article>
    );
  };

  // Render event post - horizontal card design matching user's screenshot
  const renderEventPost = (event) => {
    const user = event.user;

    return (
      <article key={`event-${event._id}`} className="feed-post event-post">
        {/* Event Card - Horizontal Layout */}
        <div className="event-horizontal-card">
          {/* Date Badge - Left Side */}
          <div className="event-date-badge">
            <span className="event-day">{event.date ? format(new Date(event.date), 'd', { locale: tr }) : '--'}</span>
            <span className="event-month">{event.date ? format(new Date(event.date), 'MMM', { locale: tr }) : '--'}</span>
            <span className="event-weekday">{event.date ? format(new Date(event.date), 'EEE', { locale: tr }) : '--'}</span>
          </div>

          {/* Event Info - Right Side */}
          <div className="event-info">
            <h3 className="event-title">{event.venue}</h3>
            <div className="event-meta">
              <span className="event-location">
                <FiMapPin size={14} />
                {event.city}
              </span>
              <span className="event-time-info">
                <FiClock size={14} />
                {event.time}
              </span>
            </div>
          </div>
        </div>

        {/* User Info - Below Card */}
        <div className="event-user-row" onClick={(e) => handleUserClick(e, user)}>
          <div className="event-user-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.username} />
            ) : (
              <div className="avatar-placeholder">
                {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="event-user-info">
            <span className="event-username">
              {user?.displayName || user?.username || 'Anonim'}
            </span>
            <span className="event-time-ago">{formatDate(event.createdAt)}</span>
          </div>
          <button className="event-more-btn" onClick={(e) => e.stopPropagation()}>
            <FiChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </article>
    );
  };

  // Render playlist post - Compact horizontal card
  const renderPlaylistPost = (playlist) => {
    const user = playlist.owner;
    const tracks = playlist.musics || [];
    const trackCount = playlist.musicCount || tracks.length || 0;
    // Get first 4 tracks for thumbnails
    const previewTracks = tracks.slice(0, 4);

    return (
      <article key={`playlist-${playlist._id}`} className="feed-post playlist-post">
        {/* User Header with "shared a playlist" text */}
        <header className="post-header" onClick={(e) => handleUserClick(e, user)}>
          <div className="post-user-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.username} />
            ) : (
              <div className="avatar-placeholder">
                {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="post-user-info">
            <div className="post-username-row">
              <span className="post-username">
                {user?.displayName || user?.username || 'Anonim'}
              </span>
              <span className="post-action-text">playlist paylaştı</span>
            </div>
            <span className="post-time">{formatDate(playlist.createdAt)}</span>
          </div>
        </header>

        {/* Compact Horizontal Card */}
        <div className="playlist-compact-card" onClick={() => handlePlaylistClick(playlist)}>
          {/* Left - Cover Image */}
          <div className="playlist-compact-cover">
            {playlist.coverImage ? (
              <img src={playlist.coverImage} alt={playlist.name} />
            ) : (
              <div className="playlist-compact-cover-placeholder">
                <FiMusic size={24} />
              </div>
            )}
            {/* Play overlay on hover */}
            <div className="playlist-compact-play">
              <FiPlay size={20} />
            </div>
          </div>

          {/* Middle - Content */}
          <div className="playlist-compact-content">
            {/* Playlist Badge */}
            <div className="playlist-type-badge">
              <FiMusic size={12} />
              <span>Playlist</span>
            </div>

            {/* Track Thumbnails */}
            {previewTracks.length > 0 && (
              <div className="playlist-compact-tracks">
                {previewTracks.map((track, index) => (
                  <div key={track._id || index} className="playlist-compact-thumb">
                    {track.imageUrl ? (
                      <img src={track.imageUrl} alt={track.title} />
                    ) : (
                      <div className="playlist-compact-thumb-placeholder">
                        <FiMusic size={10} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Playlist Info */}
            <div className="playlist-compact-info">
              <h3 className="playlist-compact-name">{playlist.name}</h3>
              <span className="playlist-compact-count">{trackCount} parça</span>
            </div>
          </div>

          {/* Right - Arrow */}
          <div className="playlist-compact-arrow">
            <FiChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
          </div>
        </div>
      </article>
    );
  };

  // Render feed item based on type
  const renderFeedItem = (item) => {
    switch (item.type) {
      case 'photo':
        return renderPhotoPost(item);
      case 'event':
        return renderEventPost(item);
      case 'playlist':
        return renderPlaylistPost(item);
      default:
        return null;
    }
  };

  // Render image detail modal
  const renderImageDetailModal = () => {
    if (!selectedImage) return null;

    const owner = selectedImage.user || selectedImage.owner;

    return (
      <div className="image-detail-overlay" onClick={closeImageDetail}>
        <div className="image-detail-modal" onClick={(e) => e.stopPropagation()}>
          {/* Mobile header */}
          <div className="image-detail-mobile-header">
            <button className="back-btn" onClick={closeImageDetail}>
              <FiChevronLeft size={24} />
            </button>
            <span>Gönderi</span>
            <div style={{ width: 24 }} />
          </div>

          <div className="image-detail-content">
            {/* Image */}
            <div className="image-detail-image">
              <img src={selectedImage.url} alt="Post" />
            </div>

            {/* Details */}
            <div className="image-detail-info">
              {/* Header */}
              <div className="image-detail-header">
                <div className="image-detail-user" onClick={(e) => handleUserClick(e, owner)}>
                  <div className="user-avatar">
                    {owner?.profileImage ? (
                      <img src={owner.profileImage} alt={owner?.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(owner?.displayName || owner?.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="user-name">
                    {owner?.displayName || owner?.username || 'Anonim'}
                  </span>
                </div>
                <button className="close-btn" onClick={closeImageDetail}>
                  <FiX size={20} />
                </button>
              </div>

              {/* Comments */}
              <div className="image-detail-comments">
                {imageDetailLoading ? (
                  <div className="comments-loading">
                    <div className="spinner"></div>
                  </div>
                ) : selectedImage.comments?.length > 0 ? (
                  selectedImage.comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-avatar">
                        {comment.user?.profileImage ? (
                          <img src={comment.user.profileImage} alt="" />
                        ) : (
                          <div className="avatar-placeholder small">
                            {(comment.user?.username || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="comment-content">
                        <span className="comment-username">{comment.user?.username}</span>
                        <span className="comment-text">{comment.text}</span>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>
                      </div>
                      {currentUser && (
                        comment.user?._id === currentUser._id ||
                        selectedImage.user?._id === currentUser._id ||
                        selectedImage.owner?._id === currentUser._id
                      ) && (
                        <button
                          className="comment-delete"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-comments">Henüz yorum yok</div>
                )}
              </div>

              {/* Actions - Only like and comment */}
              <div className="image-detail-actions">
                <div className="actions-row">
                  <div className="actions-left">
                    <button
                      className={`action-btn like-btn ${selectedImage.isLiked ? 'liked' : ''}`}
                      onClick={(e) => handleLikeImage(e, selectedImage)}
                    >
                      <FiHeart size={24} />
                    </button>
                    <button className="action-btn">
                      <FiMessageCircle size={24} />
                    </button>
                  </div>
                </div>
                {selectedImage.likeCount > 0 && (
                  <span className="likes-count">{selectedImage.likeCount} beğeni</span>
                )}
              </div>

              {/* Add comment */}
              {currentUser && (
                <form className="image-detail-comment-form" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    placeholder="Yorum ekle..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={commentSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentSubmitting}
                  >
                    {commentSubmitting ? (
                      <div className="spinner small"></div>
                    ) : (
                      <FiSend size={20} />
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="world-page instagram-style">
      {/* Feed */}
      <div className="world-feed-container">
        {loading ? (
          renderSkeleton()
        ) : feed.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="world-feed">
            {feed.map(item => renderFeedItem(item))}
            <div ref={loadMoreRef} className="load-more-trigger">
              {loadingMore && (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {renderImageDetailModal()}
    </div>
  );
};

export default WorldPage;
