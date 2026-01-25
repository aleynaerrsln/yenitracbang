// src/pages/ListingDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiMapPin,
  FiClock,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiChevronRight,
  FiPackage,
  FiUser,
  FiTag,
  FiInfo,
  FiX
} from 'react-icons/fi';
import { storeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useChat } from '../context/ChatContext';
import './ListingDetailPage.css';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { openChatWithUser } = useChat();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // İlan detayını getir
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await storeAPI.getListingById(id);

        if (response.data.success) {
          setListing(response.data.listing || response.data.data);
        } else {
          setError('İlan bulunamadı');
        }
      } catch (err) {
        console.error('Fetch listing error:', err);
        setError('İlan yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Fiyat formatlama
  const formatPrice = (price, currency = 'TRY') => {
    const symbols = { TRY: '₺', USD: '$', EUR: '€' };
    return `${symbols[currency] || '₺'}${price?.toLocaleString('tr-TR') || 0}`;
  };

  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Sonraki resim
  const nextImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Önceki resim
  const prevImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  // Paylaş
  const handleShare = async () => {
    const url = window.location.href;
    const text = `${listing?.title} - ${formatPrice(listing?.price, listing?.currency)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title, text, url });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link kopyalandı!');
    }
  };

  // Mesaj gönder
  const handleMessage = () => {
    const seller = listing?.userId;
    if (seller) {
      openChatWithUser({
        _id: seller._id || seller,
        username: seller.username || 'Satıcı',
        profileImage: seller.profileImage
      });
    }
  };

  if (loading) {
    return (
      <div className="listing-detail-page">
        <div className="listing-detail-loading">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-detail-page">
        <div className="listing-detail-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiChevronLeft size={24} />
          </button>
          <h1>İlan Detayı</h1>
          <div className="header-right"></div>
        </div>
        <div className="listing-detail-error">
          <FiPackage size={64} />
          <h3>{error || 'İlan bulunamadı'}</h3>
          <p>Bu ilan kaldırılmış veya mevcut olmayabilir.</p>
          <button onClick={() => navigate('/store')}>Mağazaya Dön</button>
        </div>
      </div>
    );
  }

  // userId bir obje mi yoksa sadece ID string mi kontrol et
  const rawSeller = listing.userId;
  const seller = typeof rawSeller === 'object' && rawSeller !== null
    ? rawSeller
    : { _id: rawSeller };
  const sellerId = seller._id || rawSeller;

  const hasImages = listing.images && listing.images.length > 0;
  const isOwnListing = user && (sellerId === user._id);

  return (
    <div className="listing-detail-page">
      {/* Header */}
      <div className="listing-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <h1>İlan Detayı</h1>
        <div className="header-right">
          <button className="share-button" onClick={handleShare}>
            <FiShare2 size={20} />
          </button>
        </div>
      </div>

      {/* Title Section - Above Image */}
      <div className="listing-title-section">
        <h2 className="listing-title">{listing.title}</h2>
      </div>

      {/* Image Gallery */}
      <div className="listing-gallery">
        <div
          className="gallery-main"
          onClick={() => hasImages && setShowFullscreen(true)}
        >
          {hasImages ? (
            <img
              src={`https://api.trackbangserver.com${listing.images[currentImageIndex].url}`}
              alt={listing.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="no-image">
              <FiPackage size={48} />
              <span>Resim yok</span>
            </div>
          )}

          {hasImages && listing.images.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                <FiChevronLeft size={20} />
              </button>
              <button className="gallery-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                <FiChevronRight size={20} />
              </button>
              <div className="gallery-counter">
                {currentImageIndex + 1} / {listing.images.length}
              </div>
            </>
          )}

          {listing.featured && (
            <span className="featured-badge">Öne Çıkan</span>
          )}
        </div>

        {/* Thumbnail Strip */}
        {hasImages && listing.images.length > 1 && (
          <div className="gallery-thumbnails">
            {listing.images.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={`https://api.trackbangserver.com${img.url}`}
                  alt={`${listing.title} ${index + 1}`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Price - Below Image */}
        <p className="listing-price">{formatPrice(listing.price, listing.currency)}</p>
      </div>

      {/* Content */}
      <div className="listing-detail-content">

        {/* Quick Stats */}
        <div className="listing-quick-stats">
          <div className="quick-stat">
            <FiEye size={16} />
            <span>{listing.views || listing.viewCount || 0} görüntülenme</span>
          </div>
          <div className="quick-stat">
            <FiHeart size={16} />
            <span>{listing.contactCount || 0} ilgi</span>
          </div>
          <div className="quick-stat">
            <FiClock size={16} />
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="listing-info-cards">
          {/* Category & Condition */}
          <div className="info-card">
            <div className="info-item">
              <FiTag size={18} />
              <div>
                <span className="info-label">Kategori</span>
                <span className="info-value">{listing.category}</span>
              </div>
            </div>
            <div className="info-item">
              <FiInfo size={18} />
              <div>
                <span className="info-label">Durum</span>
                <span className="info-value">{listing.condition}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          {(listing.location?.province || listing.location?.district) && (
            <div className="info-card">
              <div className="info-item full">
                <FiMapPin size={18} />
                <div>
                  <span className="info-label">Konum</span>
                  <span className="info-value">
                    {[listing.location.province, listing.location.district]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          {listing.specifications && (listing.specifications.brand || listing.specifications.model) && (
            <div className="info-card">
              {listing.specifications.brand && (
                <div className="info-item">
                  <span className="info-label">Marka</span>
                  <span className="info-value">{listing.specifications.brand}</span>
                </div>
              )}
              {listing.specifications.model && (
                <div className="info-item">
                  <span className="info-label">Model</span>
                  <span className="info-value">{listing.specifications.model}</span>
                </div>
              )}
              {listing.specifications.year && (
                <div className="info-item">
                  <span className="info-label">Yıl</span>
                  <span className="info-value">{listing.specifications.year}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="listing-description">
          <h3>Açıklama</h3>
          <p>{listing.description}</p>
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="listing-tags">
            {listing.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Seller Info */}
        <div className="seller-card">
          <div className="seller-info">
            <div className="seller-avatar">
              {seller.profileImage ? (
                <img src={seller.profileImage} alt={seller.username} />
              ) : (
                <FiUser size={20} />
              )}
            </div>
            <span className="seller-name">{seller.username || 'Satıcı'}</span>
          </div>
          <div className="seller-actions">
            {!isOwnListing && (
              <button className="message-btn" onClick={handleMessage}>
                <FiMessageCircle size={14} />
                <span>Mesaj Gönder</span>
              </button>
            )}
            <button
              className="view-profile-btn"
              onClick={() => {
                // Her zaman sellerId kullan (backend sadece ID ile çalışıyor)
                if (sellerId) {
                  navigate(`/profile/${sellerId}`);
                }
              }}
            >
              Profili Ziyaret Et
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showFullscreen && hasImages && (
        <div className="fullscreen-gallery" onClick={() => setShowFullscreen(false)}>
          <button className="close-fullscreen" onClick={() => setShowFullscreen(false)}>
            <FiX size={28} />
          </button>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`https://api.trackbangserver.com${listing.images[currentImageIndex].url}`}
              alt={listing.title}
            />
            {listing.images.length > 1 && (
              <>
                <button className="fullscreen-nav prev" onClick={prevImage}>
                  <FiChevronLeft size={32} />
                </button>
                <button className="fullscreen-nav next" onClick={nextImage}>
                  <FiChevronRight size={32} />
                </button>
                <div className="fullscreen-counter">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ListingDetailPage;
