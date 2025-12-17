// src/components/modals/EditPlaylistModal.jsx - PLAYLIST DÜZENLEME MODU

import { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';
import { MdDragHandle } from 'react-icons/md';
import { BiSortUp, BiSortDown } from 'react-icons/bi';
import { playlistAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SelectPlaylistModal from './SelectPlaylistModal';
import './EditPlaylistModal.css';

const EditPlaylistModal = ({ isOpen, onClose, playlist, onUpdate }) => {
  const toast = useToast();

  const [tracks, setTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSelectPlaylistOpen, setIsSelectPlaylistOpen] = useState(false);

  // Playlist musics -> tracks
  useEffect(() => {
    if (playlist?.musics) {
      setTracks(playlist.musics);
      setSelectedTracks([]);
    }
  }, [playlist?.musics]);

  if (!isOpen || !playlist) return null;

  // Track select toggle
  const toggleTrackSelection = (trackId) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const clearSelection = () => {
    setSelectedTracks([]);
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (selectedTracks.length === 0) return;

    const confirmDelete = window.confirm(
      `${selectedTracks.length} track(s) will be deleted. Continue?`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await playlistAPI.removeTrackFromPlaylist(
        playlist._id,
        selectedTracks
      );

      setTracks(prev =>
        prev.filter(t => !selectedTracks.includes(t._id))
      );

      toast.success(`${selectedTracks.length} track(s) deleted`);
      clearSelection();
    } catch (error) {
      console.error('Delete tracks error:', error);
      toast.error('Failed to delete tracks');
    } finally {
      setLoading(false);
    }
  };

  // ================= MOVE TO TOP (UI ONLY) =================
  const handleMoveToTop = () => {
    if (selectedTracks.length === 0) return;

    const selected = tracks.filter(t =>
      selectedTracks.includes(t._id)
    );
    const remaining = tracks.filter(
      t => !selectedTracks.includes(t._id)
    );

    setTracks([...selected, ...remaining]);
    toast.success('Tracks moved to top');
    clearSelection();
  };

  // ================= MOVE TO BOTTOM (UI ONLY) =================
  const handleMoveToBottom = () => {
    if (selectedTracks.length === 0) return;

    const remaining = tracks.filter(
      t => !selectedTracks.includes(t._id)
    );
    const selected = tracks.filter(t =>
      selectedTracks.includes(t._id)
    );

    setTracks([...remaining, ...selected]);
    toast.success('Tracks moved to bottom');
    clearSelection();
  };

  // ================= ADD TO PLAYLIST =================
  const handleAddTracks = () => {
    if (selectedTracks.length === 0) {
      toast.error('Please select tracks first');
      return;
    }
    setIsSelectPlaylistOpen(true);
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await playlistAPI.addTracksToPlaylist(
        playlistId,
        selectedTracks
      );
      toast.success('Tracks added to playlist');
      clearSelection();
      setIsSelectPlaylistOpen(false);
    } catch (error) {
      console.error('Add to playlist error:', error);
      toast.error('Failed to add tracks');
    }
  };

  // ================= SAVE =================
  const handleSave = () => {
    clearSelection();
    setIsSelectPlaylistOpen(false);
    onUpdate?.();
    onClose();
  };

  return (
    <div className="edit-playlist-modal">
      {/* Header */}
      <div className="edit-header">
        <button className="edit-back-btn" onClick={handleSave}>
          <FiArrowLeft size={24} />
        </button>
        <h2>Edit Playlist</h2>
        <button
          className="edit-save-btn"
          onClick={handleSave}
          disabled={loading}
        >
          Save
        </button>
      </div>

      {/* Actions */}
      <div className="edit-actions">
        <button
          className={`edit-action-btn select-btn ${
            selectedTracks.length ? 'has-selection' : ''
          }`}
          onClick={clearSelection}
          disabled={!selectedTracks.length}
        >
          <FiCheck />
          <span>{selectedTracks.length}</span>
        </button>

        <button
          className="edit-action-btn"
          onClick={handleAddTracks}
        >
          <FiPlus />
          <span>Add</span>
        </button>

        <button
          className="edit-action-btn"
          onClick={handleMoveToTop}
          disabled={!selectedTracks.length}
        >
          <BiSortUp />
          <span>Top</span>
        </button>

        <button
          className="edit-action-btn"
          onClick={handleMoveToBottom}
          disabled={!selectedTracks.length}
        >
          <BiSortDown />
          <span>Bottom</span>
        </button>

        <button
          className="edit-action-btn delete-btn"
          onClick={handleDelete}
          disabled={!selectedTracks.length}
        >
          <FiTrash2 />
          <span>Delete</span>
        </button>
      </div>

      {/* Track List */}
      <div className="edit-tracks-list">
        {tracks.length === 0 ? (
          <div className="edit-empty-state">
            <p>No tracks in this playlist</p>
          </div>
        ) : (
          tracks.map(track => {
            const isSelected = selectedTracks.includes(track._id);

            return (
              <div
                key={track._id}
                className={`edit-track-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleTrackSelection(track._id)}
              >
                <div className="track-checkbox">
                  {isSelected && <FiCheck size={18} />}
                </div>

                <div className="edit-track-cover">
                  {track.imageUrl ? (
                    <img src={track.imageUrl} alt={track.title} />
                  ) : (
                    <div className="edit-cover-fallback">♪</div>
                  )}
                </div>

                <div className="edit-track-info">
                  <h3>{track.title}</h3>
                  <p>{track.artist || 'Unknown Artist'}</p>
                </div>

                <div className="track-drag-handle">
                  <MdDragHandle size={24} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Select Playlist Modal */}
      <SelectPlaylistModal
        isOpen={isSelectPlaylistOpen}
        onClose={() => setIsSelectPlaylistOpen(false)}
        selectedTracks={selectedTracks}
        onAddToPlaylist={handleAddToPlaylist}
        currentPlaylistId={playlist._id}
      />
    </div>
  );
};

export default EditPlaylistModal;
