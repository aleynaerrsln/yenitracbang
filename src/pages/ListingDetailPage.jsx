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
  FiX,
  FiShield,
  FiExternalLink
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

        {/* Image Counter - Below thumbnails, above price */}
        {hasImages && listing.images.length > 1 && (
          <div className="gallery-counter">
            {currentImageIndex + 1} / {listing.images.length}
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

        {/* Info Card - 3 Column Grid */}
        <div className="listing-info-card">
          {/* Kategori */}
          <div className="info-row">
            <div className="info-row-icon">
              <FiTag size={18} />
            </div>
            <span className="info-row-label">Kategori</span>
            <span className="info-row-value">{listing.category}</span>
          </div>

          {/* Durum */}
          <div className="info-row">
            <div className="info-row-icon">
              <FiInfo size={18} />
            </div>
            <span className="info-row-label">Durum</span>
            <span className="info-row-value">{listing.condition}</span>
          </div>

          {/* Konum */}
          <div className="info-row">
            <div className="info-row-icon">
              <FiMapPin size={18} />
            </div>
            <span className="info-row-label">Konum</span>
            <span className="info-row-value">
              {listing.location?.district || listing.location?.province || '-'}
            </span>
          </div>
        </div>

        {/* Extra Info - Marka, Model, Yıl */}
        {listing.specifications && (listing.specifications.brand || listing.specifications.model || listing.specifications.year) && (
          <div className="listing-info-card-extra">
            {listing.specifications.brand && (
              <div className="info-row">
                <div className="info-row-icon">
                  <FiPackage size={18} />
                </div>
                <span className="info-row-label">Marka</span>
                <span className="info-row-value">{listing.specifications.brand}</span>
              </div>
            )}
            {listing.specifications.model && (
              <div className="info-row">
                <div className="info-row-icon">
                  <FiPackage size={18} />
                </div>
                <span className="info-row-label">Model</span>
                <span className="info-row-value">{listing.specifications.model}</span>
              </div>
            )}
            {listing.specifications.year && (
              <div className="info-row">
                <div className="info-row-icon">
                  <FiClock size={18} />
                </div>
                <span className="info-row-label">Yıl</span>
                <span className="info-row-value">{listing.specifications.year}</span>
              </div>
            )}
          </div>
        )}

        {/* Description - Modern */}
        <div className="listing-description">
          <div className="listing-description-header">
            <FiInfo size={16} />
            <h3>Açıklama</h3>
          </div>
          <div className="listing-description-body">
            <p>{listing.description}</p>
          </div>
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="listing-tags">
            {listing.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Modern Seller Card */}
        <div className="seller-card-modern">
          <div className="seller-card-header">
            <span className="seller-card-title">Satıcı</span>
          </div>
          
          <div className="seller-card-body">
            <div 
              className="seller-profile-section"
              onClick={() => sellerId && navigate(`/profile/${sellerId}`)}
            >
              <div className="seller-avatar-modern">
                {seller.profileImage ? (
                  <img src={seller.profileImage} alt={seller.username} />
                ) : (
                  <FiUser size={24} />
                )}
              </div>
              
              <div className="seller-details">
                <span className="seller-username">{seller.username || 'Satıcı'}</span>
                <div className="seller-badge">
                  <FiShield size={11} />
                  <span>Doğrulanmış Üye</span>
                </div>
              </div>
              
              <FiChevronRight size={18} className="seller-arrow" />
            </div>

            {!isOwnListing && (
              <div className="seller-actions-modern">
                <button className="seller-action-btn message" onClick={handleMessage}>
                  <FiMessageCircle size={16} />
                  <span>Mesaj Gönder</span>
                </button>
                <button 
                  className="seller-action-btn profile"
                  onClick={() => sellerId && navigate(`/profile/${sellerId}`)}
                >
                  <FiExternalLink size={16} />
                  <span>Profil</span>
                </button>
              </div>
            )}
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