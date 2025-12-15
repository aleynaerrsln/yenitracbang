// src/services/api.js - EKSIKSIZ VERSİYON
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarını yakala
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ENDPOINTS ==========
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getCurrentUser: () => api.get('/me'),
  logout: () => api.post('/logout'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/change-password', data),
};

// ========== GENRE ENDPOINTS ==========
export const genreAPI = {
  getAllGenres: () => api.get('/genres'),
  getGenreBySlug: (slug) => api.get(`/genres/${slug}`),
  getGenreById: (id) => api.get(`/genres/${id}`),
};

// ========== HOT ENDPOINTS ==========
export const hotAPI = {
  getHotPlaylists: () => api.get('/hot'),
  getLatestByGenre: (genre) => api.get(`/hot/genre/${genre}/latest`),
  getTrending: (params) => api.get('/hot/trending', { params }),
  getNewReleases: (params) => api.get('/hot/new-releases', { params }),
};

// ========== PLAYLIST ENDPOINTS ==========
export const playlistAPI = {
  // User Playlists
  getMyPlaylists: () => api.get('/playlists/my-playlists'),
  createPlaylist: (data) => api.post('/playlists', data),
  updatePlaylist: (id, data) => api.put(`/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/playlists/${id}`),
  
  // ⭐ Playlist Detay
  getPlaylistById: (id) => api.get(`/playlists/${id}`),
  
  // Public Playlists
  getPublicPlaylists: (params) => api.get('/playlists/public', { params }),
  getPublicWorldPlaylists: (params) => api.get('/playlists/public-world', { params }),
  
  // Category/Genre
  getPlaylistsByCategory: (category, params) => api.get(`/playlists/category/${category}`, { params }),
  
  // User Specific
  getUserPlaylists: (userId, params) => api.get(`/playlists/user/${userId}`, { params }),
  getFollowingPlaylists: (userId, params) => api.get(`/playlists/following/${userId}`, { params }),
  
  // Hot/Latest
  getLatestByCategory: () => api.get('/playlists/hot/latest'),
  
  // Search
  searchPlaylists: (query, genre) => api.get('/playlists/search', { params: { query, genre } }),
  searchPrivatePlaylists: (query, userId) => api.get('/playlists/search-private', { params: { query, userId } }),
  
  // Track Management
  addTracks: (id, trackIds) => api.post(`/playlists/${id}/tracks`, { trackIds }),
  removeTracks: (id, trackIds) => api.delete(`/playlists/${id}/tracks`, { data: { trackIds } }),
  reorderTracks: (id, trackIds) => api.put(`/playlists/${id}/tracks/reorder`, { trackIds }),
  moveTracksToTop: (id, trackIds) => api.put(`/playlists/${id}/tracks/move-top`, { trackIds }),
  moveTracksToBottom: (id, trackIds) => api.put(`/playlists/${id}/tracks/move-bottom`, { trackIds }),
  
  // Cover
  updatePlaylistName: (id, name) => api.patch(`/playlists/${id}/name`, { name }),
  updatePlaylistCover: (id, coverImage) => api.patch(`/playlists/${id}/cover`, { coverImage }),
  generateCover: (id) => api.get(`/playlists/${id}/generate-cover`),
};

// ========== MUSIC ENDPOINTS ==========
export const musicAPI = {
  // CRUD
  getAllMusic: (params) => api.get('/music', { params }),
  getMusicById: (id) => api.get(`/music/${id}`),
  addMusic: (data) => api.post('/music', data),
  updateMusic: (id, data) => api.put(`/music/${id}`, data),
  deleteMusic: (id) => api.delete(`/music/${id}`),
  
  // Featured & Popular
  getFeaturedMusic: (limit) => api.get('/music/featured', { params: { limit } }),
  getPopularMusic: (params) => api.get('/music/popular', { params }),
  getNewReleases: (params) => api.get('/music/new-releases', { params }),
  
  // By Genre
  getMusicByGenre: (genre, params) => api.get(`/music/genre/${genre}`, { params }),
  getMusicByCategory: (category, params) => api.get(`/music/category/${category}`, { params }),
  getTop10ByCategory: (genre) => api.get('/music/top10', { params: { genre } }),
  
  // By Artist
  getMusicByArtist: (artistId, params) => api.get(`/music/artist/${artistId}`, { params }),
  getMusicByArtistSlug: (slug, params) => api.get(`/music/artist/slug/${slug}`, { params }),
  
  // Search
  searchMusic: (params) => api.get('/music/search', { params }),
  searchMusicByArtist: (params) => api.get('/music/search/artist', { params }),
  searchMusicAndPlaylists: (query) => api.get('/music/search/all', { params: { q: query } }),
  searchPublicContent: (query) => api.get('/music/search/public', { params: { q: query } }),
  searchPrivateContent: (query) => api.get('/music/search/private', { params: { q: query } }),
  
  // Interactions
  likeMusic: (id) => api.post(`/music/${id}/like`),
  incrementPlayCount: (id) => api.post(`/music/${id}/play`),
  addToPlaylist: (id, playlistId) => api.post(`/music/${id}/add-to-playlist`, { playlistId }),
  
  // Info
  getMusicPlaylistInfo: (id) => api.get(`/music/${id}/playlist-info`),
};

// ========== SEARCH ENDPOINTS ==========
export const searchAPI = {
  searchAll: (query) => api.get('/search', { params: { q: query } }),
  searchMusic: (query) => api.get('/search/music', { params: { q: query } }),
  searchPlaylists: (query) => api.get('/search/playlists', { params: { q: query } }),
  searchArtists: (query) => api.get('/search/artists', { params: { q: query } }),
};

// ========== ARTIST ENDPOINTS ==========
export const artistAPI = {
  getAllArtists: (params) => api.get('/artists', { params }),
  getArtistById: (id) => api.get(`/artists/${id}`),
  getArtistBySlug: (slug) => api.get(`/artists/slug/${slug}`),
  followArtist: (id) => api.post(`/artists/${id}/follow`),
  unfollowArtist: (id) => api.post(`/artists/${id}/unfollow`),
  getFollowedArtists: () => api.get('/artists/followed'),
  claimArtist: (id, data) => api.post(`/artists/${id}/claim`, data),
};

// ========== USER ENDPOINTS ==========
export const userAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  uploadProfileImage: (formData) => api.post('/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.post(`/users/${userId}/unfollow`),
  getFollowers: () => api.get('/profile/followers'),
  getFollowing: () => api.get('/profile/following'),
};

// ========== NOTIFICATION ENDPOINTS ==========
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// ========== MESSAGE ENDPOINTS ==========
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (receiverId, message) => api.post('/messages', { receiverId, message }),
  markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`),
};

// ========== SUBSCRIPTION ENDPOINTS ==========
export const subscriptionAPI = {
  getCurrentSubscription: () => api.get('/subscriptions/current'),
  subscribe: (plan) => api.post('/subscriptions/subscribe', { plan }),
  cancelSubscription: () => api.post('/subscriptions/cancel'),
  getPlans: () => api.get('/subscriptions/plans'),
};

export default api;