// src/pages/CreateListingPage.jsx - Modern İlan Oluştur Sayfası

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiImage,
  FiX,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiTag,
  FiInfo
} from 'react-icons/fi';
import { storeAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import './CreateListingPage.css';

// Türkiye illeri
const PROVINCES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
  'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
  'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',
  'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

// Backend kategorileri
const CATEGORIES = [
  'Elektronik',
  'Müzik Enstrümanları',
  'DJ Ekipmanları',
  'Ses Sistemleri',
  'Yazılım',
  'Aksesuarlar',
  'Diğer'
];

// Ürün durumu seçenekleri (Backend enum değerleri)
const CONDITIONS = [
  { value: 'Yeni', label: 'Yeni' },
  { value: 'Az Kullanılmış', label: 'Az Kullanılmış' },
  { value: 'İyi Durumda', label: 'İyi Durumda' },
  { value: 'Orta Durumda', label: 'Orta Durumda' },
  { value: 'Tamir Gerekir', label: 'Tamir Gerekir' }
];

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    price: '',
    description: '',
    province: '',
    district: '',
    fullAddress: '',
    phoneNumber: ''
  });

  // UI state
  const [images, setImages] = useState([]);
  const [userRights, setUserRights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRights, setLoadingRights] = useState(true);
  const [errors, setErrors] = useState({});

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  // Kullanıcı haklarını yükle
  useEffect(() => {
    fetchUserRights();
  }, []);

  const fetchUserRights = async () => {
    try {
      setLoadingRights(true);
      const response = await storeAPI.getUserRights();
      if (response.data.success) {
        setUserRights(response.data.rights);
      }
    } catch (error) {
      console.error('Error fetching user rights:', error);
      showToast('İlan hakları yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingRights(false);
    }
  };

  // Input değişikliklerini handle et
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Resim seçimi
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      showToast('En fazla 5 resim ekleyebilirsiniz', 'error');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showToast(`${file.name} geçerli bir resim dosyası değil`, 'error');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name} 10MB'dan büyük`, 'error');
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  // Resim kaldır
  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Form validasyonu
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Başlık en fazla 100 karakter olabilir';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçiniz';
    }

    if (!formData.condition) {
      newErrors.condition = 'Ürün durumu seçiniz';
    }

    if (!formData.price) {
      newErrors.price = 'Fiyat zorunludur';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama zorunludur';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Açıklama en fazla 2000 karakter olabilir';
    }

    if (!formData.province) {
      newErrors.province = 'İl seçiniz';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'İlçe zorunludur';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefon numarası zorunludur';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönder
  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Lütfen tüm zorunlu alanları doldurun', 'error');
      return;
    }

    if (!userRights || userRights.availableRights <= 0) {
      showToast('İlan hakkınız bulunmuyor', 'error');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('price', formData.price);
      submitData.append('description', formData.description.trim());
      submitData.append('province', formData.province);
      submitData.append('district', formData.district.trim());
      submitData.append('phoneNumber', formData.phoneNumber.trim());

      if (formData.fullAddress.trim()) {
        submitData.append('fullAddress', formData.fullAddress.trim());
      }

      images.forEach(img => {
        submitData.append('images', img.file);
      });

      const response = await storeAPI.createListing(submitData);

      if (response.data.success) {
        showToast('İlan başarıyla oluşturuldu!', 'success');
        navigate('/store');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      let message = 'İlan oluşturulurken hata oluştu';

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.status === 500) {
        message = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
      }

      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  return (
    <div className="create-listing-page">
      {/* Header */}
      <header className="create-listing-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <h1>İlan Oluştur</h1>
        <div className="header-right">
          {!loadingRights && userRights && (
            <div className="rights-badge">
              <FiTag size={14} />
              <span>{userRights.availableRights} hak</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="create-listing-content">
        {/* İlan Hakkı Bilgisi */}
        {!loadingRights && (
          <div className={`rights-info ${userRights && userRights.availableRights > 0 ? 'has-rights' : 'no-rights'}`}>
            <div className="rights-icon">
              <FiInfo size={20} />
            </div>
            <div className="rights-text">
              <span className="rights-title">
                {userRights && userRights.availableRights > 0
                  ? 'İlan Hakkınız Mevcut'
                  : 'İlan Hakkınız Yok'}
              </span>
              <span className="rights-count">
                Kalan hakkınız: {userRights?.availableRights || 0}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="form-section">
          {/* Başlık */}
          <div className="form-group">
            <label className="form-label">
              <FiFileText size={16} />
              İlan Başlığı
            </label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Ürününüzün başlığını yazın"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
            />
            <div className="input-footer">
              {errors.title && <span className="error-text">{errors.title}</span>}
              <span className="char-count">{formData.title.length}/100</span>
            </div>
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label className="form-label">
              <FiTag size={16} />
              Kategori
            </label>
            <div className="form-dropdown">
              <button
                type="button"
                className={`dropdown-trigger ${errors.category ? 'error' : ''}`}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span className={formData.category ? 'selected' : 'placeholder'}>
                  {formData.category || 'Kategori seçin'}
                </span>
                <FiChevronDown className={showCategoryDropdown ? 'rotated' : ''} />
              </button>
              {showCategoryDropdown && (
                <div className="dropdown-menu">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`dropdown-item ${formData.category === cat ? 'selected' : ''}`}
                      onClick={() => {
                        handleInputChange('category', cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {cat}
                      {formData.category === cat && <FiCheck size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          {/* Ürün Durumu */}
          <div className="form-group">
            <label className="form-label">
              <FiTag size={16} />
              Ürün Durumu
            </label>
            <div className="form-dropdown">
              <button
                type="button"
                className={`dropdown-trigger ${errors.condition ? 'error' : ''}`}
                onClick={() => setShowConditionDropdown(!showConditionDropdown)}
              >
                <span className={formData.condition ? 'selected' : 'placeholder'}>
                  {CONDITIONS.find(c => c.value === formData.condition)?.label || 'Ürün durumu seçin'}
                </span>
                <FiChevronDown className={showConditionDropdown ? 'rotated' : ''} />
              </button>
              {showConditionDropdown && (
                <div className="dropdown-menu">
                  {CONDITIONS.map(cond => (
                    <button
                      key={cond.value}
                      type="button"
                      className={`dropdown-item ${formData.condition === cond.value ? 'selected' : ''}`}
                      onClick={() => {
                        handleInputChange('condition', cond.value);
                        setShowConditionDropdown(false);
                      }}
                    >
                      {cond.label}
                      {formData.condition === cond.value && <FiCheck size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.condition && <span className="error-text">{errors.condition}</span>}
          </div>

          {/* Fiyat */}
          <div className="form-group">
            <label className="form-label">
              <FiDollarSign size={16} />
              Fiyat (TL)
            </label>
            <input
              type="number"
              className={`form-input ${errors.price ? 'error' : ''}`}
              placeholder="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              min="0"
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          {/* Açıklama */}
          <div className="form-group">
            <label className="form-label">
              <FiFileText size={16} />
              Açıklama
            </label>
            <textarea
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Ürününüzü detaylı olarak anlatın"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={2000}
              rows={5}
            />
            <div className="input-footer">
              {errors.description && <span className="error-text">{errors.description}</span>}
              <span className="char-count">{formData.description.length}/2000</span>
            </div>
          </div>

          {/* İl */}
          <div className="form-group">
            <label className="form-label">
              <FiMapPin size={16} />
              İl
            </label>
            <div className="form-dropdown">
              <button
                type="button"
                className={`dropdown-trigger ${errors.province ? 'error' : ''}`}
                onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
              >
                <span className={formData.province ? 'selected' : 'placeholder'}>
                  {formData.province || 'İl seçin'}
                </span>
                <FiChevronDown className={showProvinceDropdown ? 'rotated' : ''} />
              </button>
              {showProvinceDropdown && (
                <div className="dropdown-menu scrollable">
                  {PROVINCES.map(province => (
                    <button
                      key={province}
                      type="button"
                      className={`dropdown-item ${formData.province === province ? 'selected' : ''}`}
                      onClick={() => {
                        handleInputChange('province', province);
                        setShowProvinceDropdown(false);
                      }}
                    >
                      {province}
                      {formData.province === province && <FiCheck size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.province && <span className="error-text">{errors.province}</span>}
          </div>

          {/* İlçe */}
          <div className="form-group">
            <label className="form-label">
              <FiMapPin size={16} />
              İlçe
            </label>
            <input
              type="text"
              className={`form-input ${errors.district ? 'error' : ''}`}
              placeholder="İlçe seçin"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
            />
            {errors.district && <span className="error-text">{errors.district}</span>}
          </div>

          {/* Tam Adres (Opsiyonel) */}
          <div className="form-group">
            <label className="form-label">
              <FiMapPin size={16} />
              Tam Adres (Opsiyonel)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Mahalle, sokak, no..."
              value={formData.fullAddress}
              onChange={(e) => handleInputChange('fullAddress', e.target.value)}
              maxLength={300}
            />
            <div className="input-footer">
              <span className="char-count">{formData.fullAddress.length}/300</span>
            </div>
          </div>

          {/* Görseller */}
          <div className="form-group">
            <label className="form-label">
              <FiImage size={16} />
              Görseller ({images.length}/5)
            </label>
            <div className="images-section">
              <div className="images-grid">
                {images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img.preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    className="add-image-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiImage size={24} />
                    <span>Fotoğraf ekleyin</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Telefon Numarası */}
          <div className="form-group">
            <label className="form-label">
              <FiPhone size={16} />
              Telefon Numarası
            </label>
            <input
              type="tel"
              className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              placeholder="05xx xxx xx xx"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            />
            {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
          </div>
        </div>
      </div>

      {/* Footer - Submit Button */}
      <div className="create-listing-footer">
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !userRights || userRights.availableRights <= 0}
        >
          {loading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
        </button>
      </div>
    </div>
  );
};

export default CreateListingPage;
