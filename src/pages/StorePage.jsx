// src/pages/StorePage.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiChevronDown,
  FiPlus,
  FiPackage,
  FiChevronLeft,
  FiMapPin,
  FiClock,
  FiEye,
  FiHeart,
  FiSliders,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { storeAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import './StorePage.css';

// Kategoriler (Backend StoreListing.js enum'dan)
const CATEGORIES = [
  { value: '', label: 'Tümü' },
  { value: 'Elektronik', label: 'Elektronik' },
  { value: 'Müzik Enstrümanları', label: 'Müzik Enstrümanları' },
  { value: 'DJ Ekipmanları', label: 'DJ Ekipmanları' },
  { value: 'Ses Sistemleri', label: 'Ses Sistemleri' },
  { value: 'Yazılım', label: 'Yazılım' },
  { value: 'Aksesuarlar', label: 'Aksesuarlar' },
  { value: 'Diğer', label: 'Diğer' },
];

// Sıralama seçenekleri (Backend destekli alanlar)
const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Yeniden Eskiye' },
  { value: 'createdAt:asc', label: 'Eskiden Yeniye' },
  { value: 'price:asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price:desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'views:desc', label: 'En Çok Görüntülenen' },
];

const StorePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('createdAt:desc');
  const [userRights, setUserRights] = useState(null);

  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    minPrice: '',
    maxPrice: '',
    province: '',
    district: '',
  });
  const [activeFilters, setActiveFilters] = useState({
    minPrice: '',
    maxPrice: '',
    province: '',
    district: '',
  });

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalListings, setTotalListings] = useState(0);

  // Aktif filtre sayısı
  const activeFilterCount = Object.values(activeFilters).filter(v => v !== '').length;

  // İlanları getir
  const fetchListings = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;

      const [sortBy, sortOrder] = selectedSort.split(':');

      const params = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      // Backend destekli filtreler
      if (activeFilters.minPrice) {
        params.minPrice = activeFilters.minPrice;
      }
      if (activeFilters.maxPrice) {
        params.maxPrice = activeFilters.maxPrice;
      }
      if (activeFilters.province) {
        params.province = activeFilters.province;
      }
      if (activeFilters.district) {
        params.district = activeFilters.district;
      }

      const response = await storeAPI.getListings(params);

      if (response.data.success) {
        const newListings = response.data.listings || response.data.data || [];

        if (resetPage) {
          setListings(newListings);
          setPage(1);
        } else {
          setListings(prev => currentPage === 1 ? newListings : [...prev, ...newListings]);
        }

        const pagination = response.data.pagination || {};
        setTotalListings(pagination.totalItems || pagination.total || 0);
        setHasMore(pagination.hasNext || newListings.length === 20);
      }
    } catch (error) {
      console.error('Fetch listings error:', error);
      setListings([]);
      setTotalListings(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory, selectedSort, activeFilters]);

  // Kullanıcı haklarını getir
  const fetchUserRights = async () => {
    try {
      const response = await storeAPI.getUserRights();
      if (response.data.success) {
        setUserRights(response.data.rights || response.data);
      }
    } catch (error) {
      console.error('Fetch rights error:', error);
      setUserRights({ availableRights: 0 });
    }
  };

  // İlk yükleme
  useEffect(() => {
    fetchListings(true);
    fetchUserRights();
  }, []);

  // Filtre değiştiğinde
  useEffect(() => {
    fetchListings(true);
  }, [selectedCategory, selectedSort, activeFilters]);

  // Arama debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchListings(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Dropdown dışına tıklama
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-dropdown')) {
        setShowCategoryDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Daha fazla yükle
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchListings(false);
    }
  }, [page]);

  // Filter Modal Aç
  const openFilterModal = () => {
    setTempFilters({ ...activeFilters });
    setShowFilterModal(true);
  };

  // Filtreleri Uygula
  const applyFilters = () => {
    setActiveFilters({ ...tempFilters });
    setShowFilterModal(false);
  };

  // Filtreleri Temizle
  const clearFilters = () => {
    const emptyFilters = {
      minPrice: '',
      maxPrice: '',
      province: '',
      district: '',
    };
    setTempFilters(emptyFilters);
  };

  // Tüm filtreleri sıfırla
  const resetAllFilters = () => {
    const emptyFilters = {
      minPrice: '',
      maxPrice: '',
      province: '',
      district: '',
    };
    setActiveFilters(emptyFilters);
    setSelectedCategory('');
    setSelectedSort('createdAt:desc');
    setSearchQuery('');
  };

  // Fiyat formatlama
  const formatPrice = (price, currency = 'TRY') => {
    const symbols = { TRY: '₺', USD: '$', EUR: '€' };
    return `${symbols[currency] || '₺'}${price?.toLocaleString('tr-TR') || 0}`;
  };

  // Tarih formatlama
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  // Kategori label'ı bul
  const getCategoryLabel = (value) => {
    return CATEGORIES.find(c => c.value === value)?.label || 'Tümü';
  };

  // Sort label'ı bul
  const getSortLabel = (value) => {
    return SORT_OPTIONS.find(s => s.value === value)?.label || 'Yeniden Eskiye';
  };

  return (
    <div className="store-page">
      {/* Header */}
      <div className="store-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <h1>Mağaza</h1>
        <div className="header-right">
          {userRights && (
            <div className="rights-badge">
              <FiPackage size={16} />
              <span>{userRights.availableRights || 0}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="store-search">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" size={18} />
          <input
            type="text"
            placeholder="İlan ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="store-filters">
        {/* Category Filter */}
        <div className="filter-dropdown">
          <button
            className={`filter-btn ${selectedCategory ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowSortDropdown(false);
            }}
          >
            <span>{getCategoryLabel(selectedCategory)}</span>
            <FiChevronDown size={16} className={showCategoryDropdown ? 'rotated' : ''} />
          </button>

          {showCategoryDropdown && (
            <div className="dropdown-menu">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`dropdown-item ${selectedCategory === cat.value ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setShowCategoryDropdown(false);
                  }}
                >
                  {cat.label}
                  {selectedCategory === cat.value && <FiCheck size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Filter */}
        <div className="filter-dropdown">
          <button
            className="filter-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowSortDropdown(!showSortDropdown);
              setShowCategoryDropdown(false);
            }}
          >
            <span>{getSortLabel(selectedSort).length > 15 ? getSortLabel(selectedSort).substring(0, 15) + '...' : getSortLabel(selectedSort)}</span>
            <FiChevronDown size={16} className={showSortDropdown ? 'rotated' : ''} />
          </button>

          {showSortDropdown && (
            <div className="dropdown-menu">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`dropdown-item ${selectedSort === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSort(opt.value);
                    setShowSortDropdown(false);
                  }}
                >
                  {opt.label}
                  {selectedSort === opt.value && <FiCheck size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Button */}
        <button
          className={`filter-btn filter-advanced ${activeFilterCount > 0 ? 'active' : ''}`}
          onClick={openFilterModal}
        >
          <FiSliders size={16} />
          <span>Filtrele</span>
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="active-filters-bar">
          <div className="active-filters-list">
            {activeFilters.minPrice && (
              <span className="active-filter-tag">
                Min: ₺{activeFilters.minPrice}
                <button onClick={() => setActiveFilters(prev => ({ ...prev, minPrice: '' }))}>
                  <FiX size={12} />
                </button>
              </span>
            )}
            {activeFilters.maxPrice && (
              <span className="active-filter-tag">
                Max: ₺{activeFilters.maxPrice}
                <button onClick={() => setActiveFilters(prev => ({ ...prev, maxPrice: '' }))}>
                  <FiX size={12} />
                </button>
              </span>
            )}
            {activeFilters.province && (
              <span className="active-filter-tag">
                {activeFilters.province}
                <button onClick={() => setActiveFilters(prev => ({ ...prev, province: '', district: '' }))}>
                  <FiX size={12} />
                </button>
              </span>
            )}
            {activeFilters.district && (
              <span className="active-filter-tag">
                {activeFilters.district}
                <button onClick={() => setActiveFilters(prev => ({ ...prev, district: '' }))}>
                  <FiX size={12} />
                </button>
              </span>
            )}
          </div>
          <button className="clear-all-btn" onClick={resetAllFilters}>
            Temizle
          </button>
        </div>
      )}

      {/* Content */}
      <div className="store-content">
        {loading && listings.length === 0 ? (
          <div className="store-loading">
            <div className="loading-spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="store-empty">
            <div className="empty-icon">
              <FiPackage size={48} />
            </div>
            <h3>Henüz ilan bulunmuyor</h3>
            <p>İlk ilanı siz verin!</p>
          </div>
        ) : (
          <>
            <div className="listings-grid">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="listing-card"
                  onClick={() => navigate(`/store/${listing._id}`)}
                >
                  <div className="listing-image">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={`https://api.trackbangserver.com${listing.images[0].url}`}
                        alt={listing.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="no-image" style={{ display: listing.images?.length > 0 ? 'none' : 'flex' }}>
                      <FiPackage size={32} />
                    </div>
                    {listing.featured && (
                      <span className="featured-badge">Öne Çıkan</span>
                    )}
                  </div>

                  <div className="listing-info">
                    <h3 className="listing-title">{listing.title}</h3>
                    <p className="listing-price">
                      {formatPrice(listing.price, listing.currency)}
                    </p>

                    <div className="listing-meta">
                      {listing.location?.province && (
                        <span className="meta-item">
                          <FiMapPin size={12} />
                          {listing.location.province}
                        </span>
                      )}
                      <span className="meta-item">
                        <FiClock size={12} />
                        {formatDate(listing.createdAt)}
                      </span>
                    </div>

                    <div className="listing-stats">
                      <span className="stat-item">
                        <FiEye size={12} />
                        {listing.viewCount || listing.views || 0}
                      </span>
                      <span className="stat-item">
                        <FiHeart size={12} />
                        {listing.contactCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="load-more-wrapper">
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fab-button"
        onClick={() => navigate('/store/create')}
      >
        <FiPlus size={24} />
        <span>İlan Ver</span>
      </button>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="filter-modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h2>Filtrele</h2>
              <button className="filter-modal-close" onClick={() => setShowFilterModal(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="filter-modal-content">
              {/* Fiyat Aralığı */}
              <div className="filter-section">
                <label className="filter-label">Fiyat Aralığı (₺)</label>
                <div className="price-range-inputs">
                  <div className="price-input-wrapper">
                    <input
                      type="number"
                      placeholder="Min"
                      value={tempFilters.minPrice}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="filter-input"
                    />
                  </div>
                  <span className="price-separator">-</span>
                  <div className="price-input-wrapper">
                    <input
                      type="number"
                      placeholder="Max"
                      value={tempFilters.maxPrice}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="filter-input"
                    />
                  </div>
                </div>
              </div>

              {/* İl */}
              <div className="filter-section">
                <label className="filter-label">İl</label>
                <input
                  type="text"
                  placeholder="Şehir girin..."
                  value={tempFilters.province}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, province: e.target.value }))}
                  className="filter-input full-width"
                />
              </div>

              {/* İlçe */}
              <div className="filter-section">
                <label className="filter-label">İlçe</label>
                <input
                  type="text"
                  placeholder="İlçe girin..."
                  value={tempFilters.district}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="filter-input full-width"
                />
              </div>
            </div>

            <div className="filter-modal-footer">
              <button className="filter-btn-secondary" onClick={clearFilters}>
                Temizle
              </button>
              <button className="filter-btn-primary" onClick={applyFilters}>
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
