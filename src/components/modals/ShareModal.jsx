// src/components/modals/ShareModal.jsx
import React from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaTwitter, FaFacebook } from 'react-icons/fa';
import { useState } from 'react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, trackInfo, position }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Paylaşım URL'i oluştur
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    if (trackInfo?.id) {
      return `${baseUrl}/track/${trackInfo.id}`;
    }
    return window.location.href;
  };

  const getShareText = () => {
    if (trackInfo?.title && trackInfo?.artist) {
      return `${trackInfo.title} - ${trackInfo.artist} | TrackBang`;
    }
    return 'Check out this track on TrackBang!';
  };

  const shareUrl = getShareUrl();
  const shareText = getShareText();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trackInfo?.title || 'TrackBang',
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div
        className="share-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          top: position?.top || 0,
          left: position?.left || 0
        }}
      >
        <div className="share-header">
          <h3>Share</h3>
        </div>

        {/* Track Info Preview */}
        {trackInfo && (
          <div className="share-track-preview">
            {trackInfo.imageUrl && (
              <img src={trackInfo.imageUrl} alt={trackInfo.title} className="share-track-image" />
            )}
            <div className="share-track-info">
              <span className="share-track-title">{trackInfo.title}</span>
              <span className="share-track-artist">{trackInfo.artist}</span>
            </div>
          </div>
        )}

        <div className="share-options">
          {/* Copy Link */}
          <button className="share-option copy" onClick={handleCopyLink}>
            {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          {/* WhatsApp */}
          <button className="share-option whatsapp" onClick={handleWhatsAppShare}>
            <FaWhatsapp size={20} />
            <span>WhatsApp</span>
          </button>

          {/* Telegram */}
          <button className="share-option telegram" onClick={handleTelegramShare}>
            <FaTelegram size={20} />
            <span>Telegram</span>
          </button>

          {/* Twitter */}
          <button className="share-option twitter" onClick={handleTwitterShare}>
            <FaTwitter size={20} />
            <span>Twitter</span>
          </button>

          {/* Facebook */}
          <button className="share-option facebook" onClick={handleFacebookShare}>
            <FaFacebook size={20} />
            <span>Facebook</span>
          </button>

          {/* Native Share (Mobile) */}
          {navigator.share && (
            <button className="share-option native" onClick={handleNativeShare}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span>More Options</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
