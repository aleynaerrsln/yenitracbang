// src/components/modals/CreatePlaylistModal.jsx - MODAL COMPONENT

import { useState } from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import './CreatePlaylistModal.css';

const CreatePlaylistModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    coverImage: null,
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview için
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData({ ...formData, coverImage: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        isPublic: true,
        coverImage: null,
      });
      setCoverPreview(null);
      onClose();
    } catch (error) {
      console.error('Create playlist error:', error);
      alert('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        isPublic: true,
        coverImage: null,
      });
      setCoverPreview(null);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Create Playlist</h2>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Cover Upload */}
          <div className="cover-upload-section">
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleCoverChange}
              style={{ display: 'none' }}
              disabled={loading}
            />
            <label htmlFor="cover-upload" className="cover-upload-btn">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" />
              ) : (
                <>
                  <FiImage size={32} />
                  <span>Add Cover</span>
                </>
              )}
            </label>
          </div>

          {/* Name Input */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="My Playlist"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              maxLength={50}
              required
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Add a description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              maxLength={200}
              rows={3}
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="form-group toggle-group">
            <div className="toggle-label">
              <span className="globe-icon">🌍</span>
              <span>Public</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                disabled={loading}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creating...' : 'Create Playlist'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;