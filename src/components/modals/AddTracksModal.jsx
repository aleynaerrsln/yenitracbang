// src/components/modals/AddTracksModal.jsx - ŞARKI EKLEME SAYFASI

import { useState, useEffect } from 'react';
import { FiX, FiSearch, FiCheck } from 'react-icons/fi';
import { musicAPI } from '../../services/api';
import './AddTracksModal.css';

const AddTracksModal = ({ isOpen, onClose, onAddTracks, playlistId, singleSelect = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchTracks();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchTracks = async () => {
    try {
      setLoading(true);
      const response = await musicAPI.searchMusic(searchQuery);
      if (response.data.success) {
        setSearchResults(response.data.musics || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrackSelection = (track) => {
    if (singleSelect) {
      // Single select mode - doğrudan callback çağır
      onAddTracks(track);
      handleClose();
      return;
    }

    // Multiple select mode
    const isSelected = selectedTracks.some(t => t._id === track._id);
    
    if (isSelected) {
      setSelectedTracks(selectedTracks.filter(t => t._id !== track._id));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const isTrackSelected = (trackId) => {
    return selectedTracks.some(t => t._id === trackId);
  };

  const handleDone = async () => {
    if (selectedTracks.length > 0) {
      await onAddTracks(selectedTracks);
      setSelectedTracks([]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleClose = () => {
    setSelectedTracks([]);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-tracks-modal" onClick={handleClose}>
      <div className="add-tracks-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-tracks-header">
          <button className="close-btn" onClick={handleClose}>
            <FiX size={24} />
          </button>
          <h2>Add Tracks</h2>
          <button 
            className="done-btn"
            onClick={handleDone}
            disabled={selectedTracks.length === 0}
          >
            Done ({selectedTracks.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="search-results">
          {loading ? (
            <div className="loading-state">
              <p>Searching...</p>
            </div>
          ) : searchResults.length === 0 && searchQuery ? (
            <div className="empty-state">
              <p>No tracks found</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="empty-state">
              <p>Search for tracks to add</p>
            </div>
          ) : (
            searchResults.map((track) => {
              const selected = isTrackSelected(track._id);
              return (
                <button
                  key={track._id}
                  className={`track-result ${selected ? 'selected' : ''}`}
                  onClick={() => toggleTrackSelection(track)}
                >
                  <div className="track-cover">
                    {track.imageUrl ? (
                      <img src={track.imageUrl} alt={track.title} />
                    ) : (
                      <div className="cover-fallback">♪</div>
                    )}
                  </div>
                  <div className="track-info">
                    <h3>{track.title}</h3>
                    <p>{track.artist || 'Unknown Artist'}</p>
                  </div>
                  <div className={`selection-indicator ${selected ? 'selected' : ''}`}>
                    {selected && <FiCheck size={20} />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTracksModal;