// src/components/modals/ImageCropperModal.jsx
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FiX, FiZoomIn, FiZoomOut, FiCheck } from 'react-icons/fi';
import './ImageCropperModal.css';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    // Base64 için crossOrigin gerekli değil
    if (url.startsWith('http')) {
      image.crossOrigin = 'anonymous';
    }
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, quality = 0.95) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Debug: değerleri logla
  console.log('🖼️ Crop Debug:', {
    imageNaturalSize: { width: image.naturalWidth, height: image.naturalHeight },
    pixelCrop: pixelCrop
  });

  // Canvas boyutunu kırpılan alan boyutunda ayarla
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Yüksek kaliteli rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Kırpma: kaynak resimden belirtilen alanı al, canvas'a çiz
  ctx.drawImage(
    image,
    pixelCrop.x,        // kaynak x
    pixelCrop.y,        // kaynak y
    pixelCrop.width,    // kaynak genişlik
    pixelCrop.height,   // kaynak yükseklik
    0,                  // hedef x
    0,                  // hedef y
    pixelCrop.width,    // hedef genişlik
    pixelCrop.height    // hedef yükseklik
  );

  // Yüksek kaliteli JPEG olarak döndür
  return canvas.toDataURL('image/jpeg', quality);
};

const ImageCropperModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 16 / 9, // Arka plan için varsayılan
  cropShape = 'rect', // 'rect' veya 'round'
  title = 'Resmi Düzenle'
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaSize, setMediaSize] = useState(null);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log('📐 Crop Area:', { croppedArea, croppedAreaPixels });
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onMediaLoaded = useCallback((mediaSize) => {
    console.log('🖼️ Media Loaded:', mediaSize);
    setMediaSize(mediaSize);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setLoading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0.95);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Resim kırpma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setMediaSize(null);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="image-cropper-overlay" onClick={handleClose}>
      <div className="image-cropper-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="image-cropper-header">
          <h3>{title}</h3>
          <button className="cropper-close-btn" onClick={handleClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="image-cropper-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={cropShape}
            showGrid={true}
            objectFit="contain"
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
            onMediaLoaded={onMediaLoaded}
          />
        </div>

        {/* Controls */}
        <div className="image-cropper-controls">
          <div className="zoom-control">
            <button
              className="zoom-btn"
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              disabled={zoom <= 1}
            >
              <FiZoomOut size={18} />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="zoom-slider"
            />
            <button
              className="zoom-btn"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              disabled={zoom >= 3}
            >
              <FiZoomIn size={18} />
            </button>
          </div>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Footer */}
        <div className="image-cropper-footer">
          <button className="cropper-cancel-btn" onClick={handleClose}>
            İptal
          </button>
          <button
            className="cropper-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <div className="cropper-spinner"></div>
            ) : (
              <>
                <FiCheck size={18} />
                Uygula
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
