// src/pages/WorldPage.jsx - Instagram Style Feed

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  FiHeart, FiMessageCircle, FiShare2, FiBookmark,
  FiMoreHorizontal, FiMusic, FiPlay
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import './WorldPage.css';

const WorldPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await playlistAPI.getPublicWorldPlaylists({
        page: pageNum,
        limit: 10
      });

      if (response.data.success) {
        const newPosts = response.data.playlists || [];

        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        const pagination = response.data.pagination;
        setHasMore(pagination?.currentPage < pagination?.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      if (pageNum === 1) {
        toast.error('Gönderiler yüklenemedi');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPosts(page + 1, true);
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
  }, [loading, loadingMore, hasMore, page, fetchPosts]);

  // Navigate to playlist
  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`, { state: { playlist } });
  };

  // Navigate to user profile
  const handleUserClick = (e, owner) => {
    e.stopPropagation();
    if (owner?._id) {
      navigate(`/profile/${owner._id}`);
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

  // Like handler (placeholder - backend integration needed)
  const handleLike = (e, postId) => {
    e.stopPropagation();
    // TODO: Implement like functionality
    toast.info('Beğeni özelliği yakında eklenecek');
  };

  // Share handler
  const handleShare = async (e, post) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.name,
          text: `${post.owner?.displayName || post.owner?.username}'ın playlist'i: ${post.name}`,
          url: `${window.location.origin}/playlist/${post._id}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/playlist/${post._id}`);
        toast.success('Link kopyalandı');
      }
    } catch (error) {
      console.error('Share error:', error);
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
      <h3>Henüz gönderi yok</h3>
      <p>Kullanıcılar playlist paylaştığında burada görünecek</p>
    </div>
  );

  return (
    <div className="world-page instagram-style">
      {/* Feed */}
      <div className="world-feed-container">
        {loading ? (
          renderSkeleton()
        ) : posts.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="world-feed">
            {posts.map((post) => (
              <article key={post._id} className="feed-post">
                {/* Post Header - User Info */}
                <header className="post-header" onClick={(e) => handleUserClick(e, post.owner)}>
                  <div className="post-user-avatar">
                    {post.owner?.profileImage ? (
                      <img src={post.owner.profileImage} alt={post.owner?.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(post.owner?.displayName || post.owner?.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="post-user-info">
                    <span className="post-username">
                      {post.owner?.displayName || post.owner?.username || 'Anonim'}
                    </span>
                    <span className="post-time">{formatDate(post.createdAt)}</span>
                  </div>
                  <button className="post-more-btn" onClick={(e) => e.stopPropagation()}>
                    <FiMoreHorizontal size={20} />
                  </button>
                </header>

                {/* Post Content - Playlist Image */}
                <div className="post-content" onClick={() => handlePlaylistClick(post)}>
                  <div className="post-image-container">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.name} className="post-image" />
                    ) : (
                      <div className="post-image-placeholder">
                        <FiMusic size={64} />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="post-play-overlay">
                      <div className="play-button">
                        <FiPlay size={32} />
                      </div>
                    </div>
                    {/* Track count badge */}
                    <div className="post-track-badge">
                      <FiMusic size={14} />
                      <span>{post.musicCount || 0} şarkı</span>
                    </div>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="post-actions">
                  <div className="post-actions-left">
                    <button
                      className="action-btn like-btn"
                      onClick={(e) => handleLike(e, post._id)}
                    >
                      <FiHeart size={24} />
                    </button>
                    <button
                      className="action-btn comment-btn"
                      onClick={() => handlePlaylistClick(post)}
                    >
                      <FiMessageCircle size={24} />
                    </button>
                    <button
                      className="action-btn share-btn"
                      onClick={(e) => handleShare(e, post)}
                    >
                      <FiShare2 size={24} />
                    </button>
                  </div>
                  <button className="action-btn bookmark-btn">
                    <FiBookmark size={24} />
                  </button>
                </div>

                {/* Post Stats */}
                <div className="post-stats">
                  {(post.likes > 0 || post.views > 0) && (
                    <span className="post-likes">
                      {post.likes > 0 && `${post.likes} beğeni`}
                      {post.likes > 0 && post.views > 0 && ' • '}
                      {post.views > 0 && `${post.views} görüntülenme`}
                    </span>
                  )}
                </div>

                {/* Post Caption */}
                <div className="post-caption">
                  <span
                    className="caption-username"
                    onClick={(e) => handleUserClick(e, post.owner)}
                  >
                    {post.owner?.displayName || post.owner?.username}
                  </span>
                  <span className="caption-text">{post.name}</span>
                  {post.description && (
                    <p className="caption-description">{post.description}</p>
                  )}
                </div>

                {/* Genre Tag */}
                {post.genre && (
                  <div className="post-genre-tag">
                    #{post.genre}
                  </div>
                )}
              </article>
            ))}

            {/* Load more trigger */}
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
    </div>
  );
};

export default WorldPage;
