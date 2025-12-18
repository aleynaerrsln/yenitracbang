// src/pages/MyPlaylistDetail.jsx - DELETE MODAL EKLENDI

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { RxScissors } from 'react-icons/rx';
import { playlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import AddTracksModal from '../components/modals/AddTracksModal';
import EditPlaylistModal from '../components/modals/EditPlaylistModal';
import RenamePlaylistModal from '../components/modals/RenamePlaylistModal';
import DeletePlaylistModal from '../components/modals/DeletePlaylistModal';
import TrackCard from '../components/tracks/TrackCard';
import './MyPlaylistDetail.css';

const MyPlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAddTracksOpen, setIsAddTracksOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      const response = await playlistAPI.getPlaylistById(id);
      if (response.data.success) {
        setPlaylist(response.data.playlist);
      }
    } catch (error) {
      console.error('Fetch playlist error:', error);
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTracks = async (selectedTracks) => {
    try {
      const trackIds = selectedTracks.map(t => t._id);
      const response = await playlistAPI.addTracksToPlaylist(id, trackIds);
      
      if (response.data.success) {
        toast.success(`${selectedTracks.length} tracks added`);
        setIsAddTracksOpen(false);
        fetchPlaylistDetails();
      }
    } catch (error) {
      console.error('Add tracks error:', error);
      toast.error('Failed to add tracks');
    }
  };

  const handleEditPlaylist = () => {
    setIsEditOpen(true);
  };

  const handleRenamePlaylist = () => {
    setIsRenameOpen(true);
  };

  const handleSaveRename = async (newName) => {
    try {
      const response = await playlistAPI.updatePlaylist(id, { name: newName });
      
      if (response.data.success) {
        setPlaylist(prev => ({ ...prev, name: newName }));
        toast.success('Playlist renamed');
        setIsRenameOpen(false);
      }
    } catch (error) {
      console.error('Rename error:', error);
      toast.error('Failed to rename playlist');
    }
  };

  const handleDeletePlaylist = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await playlistAPI.deletePlaylist(id);
      
      if (response.data.success) {
        toast.success('Playlist deleted');
        navigate('/library');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete playlist');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLikeTrack = (track) => {
    // TODO: Like track functionality
    console.log('Like track:', track);
  };

  if (loading) {
    return (
      <div className="my-playlist-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="my-playlist-loading">
        <p>Playlist not found</p>
      </div>
    );
  }

  const tracks = playlist.musics || [];
  const trackCount = tracks.length;
  const hasTracks = trackCount > 0;

  return (
    <div className="my-playlist-detail">
      {/* Edit Playlist Modal */}
      {isEditOpen ? (
        <EditPlaylistModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          playlist={playlist}
          onUpdate={fetchPlaylistDetails}
        />
      ) : (
        <>
          {/* Back Button */}
          <button className="my-back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>

          {/* Playlist Cover */}
          <div className="my-cover-container">
            <div className="my-cover-image">
              {playlist.coverImage ? (
                <img src={playlist.coverImage} alt={playlist.name} />
              ) : (
                <div className="my-cover-placeholder">
                  <div className="my-placeholder-text">{playlist.name?.charAt(0)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Playlist Info */}
          <div className="my-playlist-info">
            <h1>{playlist.name}</h1>
            <p>{trackCount} tracks</p>
          </div>

          {/* Action Buttons */}
          <div className="my-action-grid">
            <button className="my-action-btn" onClick={() => setIsAddTracksOpen(true)}>
              <FiPlus size={20} />
              <span>Add Tracks</span>
            </button>

            <button className="my-action-btn" onClick={handleEditPlaylist}>
              <FiEdit2 size={20} />
              <span>Edit Playlist</span>
            </button>

            <button className="my-action-btn" onClick={handleRenamePlaylist}>
              <FiEdit3 size={20} />
              <span>Rename Playlist</span>
            </button>

            <button className="my-action-btn my-delete-btn" onClick={handleDeletePlaylist}>
              <FiTrash2 size={20} />
              <span>Delete Playlist</span>
            </button>
          </div>

          {/* Tracks Section */}
          {!hasTracks ? (
            <div className="my-empty-state">
              <div className="my-empty-icon">
                <RxScissors size={56} />
              </div>
              <h2>No Tracks Yet</h2>
              <p>Add tracks to start building your playlist</p>
            </div>
          ) : (
            <div className="my-tracks-section">
              <div className="tracks-header">
                <div className="tracks-title">
                  <span className="title-accent"></span>
                  <h3>Tracks ({trackCount})</h3>
                </div>
              </div>
              
              <div className="my-tracks-list">
                {tracks.map((track) => (
                  <TrackCard 
                    key={track._id} 
                    track={track}
                    onLike={handleLikeTrack}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Tracks Modal */}
      <AddTracksModal
        isOpen={isAddTracksOpen}
        onClose={() => setIsAddTracksOpen(false)}
        onAddTracks={handleAddTracks}
        playlistId={id}
      />

      {/* Rename Modal */}
      <RenamePlaylistModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        currentName={playlist?.name}
        onSave={handleSaveRename}
      />

      {/* Delete Modal */}
      <DeletePlaylistModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        playlistName={playlist?.name}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyPlaylistDetail;