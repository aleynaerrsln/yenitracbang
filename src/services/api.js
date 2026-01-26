// src/services/api.js - FULL VERSION WITH CORRECTIONS

import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.trackbangserver.com/api';

// Axios instance (authenticated)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public axios instance (no auth redirect)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================= INTERCEPTORS =================

// Request – token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response – 401 yakala
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

// Public API - token ekle ama 401'de redirect yapma
publicApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= AUTH =================
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getCurrentUser: () => api.get('/me'),
  logout: () => api.post('/logout'),
  updateProfile: (data) => api.put('/profile', data),

  // Settings - Account Management
  updateProfileInfo: (data) => api.put('/profile-info', data),
  changePassword: (data) => api.post('/change-password', data),
  requestEmailUpdate: (data) => api.post('/request-email-update', data),
  confirmEmailUpdate: (data) => api.post('/confirm-email-update', data),
  deleteAccount: (data) => api.delete('/account', { data }),
};

// ================= GENRE =================
export const genreAPI = {
  getAllGenres: () => api.get('/genres'),
  getGenreBySlug: (slug) => api.get(`/genres/${slug}`),
  getGenreById: (id) => api.get(`/genres/${id}`),
};

// ================= HOT =================
export const hotAPI = {
  getHotPlaylists: () => api.get('/hot'),
  getTrending: (params) => api.get('/hot/trending', { params }),
  getNewReleases: (params) => api.get('/hot/new-releases', { params }),
  getLatestByGenre: (genre) =>
    api.get(`/hot/genre/${genre}/latest`),
};

// ================= PLAYLIST =================
export const playlistAPI = {
  // User
  getMyPlaylists: () => api.get('/playlists/my-playlists'),
  createPlaylist: (data) => {
    // FormData ise, axios otomatik Content-Type set eder
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.post('/playlists', data, config);
  },
  addTracksToPlaylist: (id, trackIds) => api.post(`/playlists/${id}/tracks`, { trackIds }),
  removeTrackFromPlaylist: (id, trackIds) => {
    // Tek track ise array'e çevir
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds];
    return api.delete(`/playlists/${id}/tracks`, { data: { trackIds: ids } });
  },
  moveTracksToTop: (id, trackIds) => api.put(`/playlists/${id}/reorder/top`, { trackIds }),
  moveTracksToBottom: (id, trackIds) => api.put(`/playlists/${id}/reorder/bottom`, { trackIds }),
  updatePlaylist: (id, data) =>
    api.put(`/playlists/${id}`, data),
  deletePlaylist: (id) =>
    api.delete(`/playlists/${id}`),

  // Detail
  getPlaylistById: (id) =>
    api.get(`/playlists/${id}`),

  // Public / Charts
  getPublicPlaylists: (params) =>
    api.get('/playlists/public', { params }),
  getPublicWorldPlaylists: (params) =>
    api.get('/playlists/public-world', { params }),
  getLatestByCategory: () =>
    api.get('/playlists/hot/latest'),

  // Category
  getPlaylistsByCategory: (category, params) =>
    api.get(`/playlists/category/${category}`, { params }),

  // User based
  getUserPlaylists: (userId, params) =>
    api.get(`/playlists/user/${userId}`, { params }),
  getFollowingPlaylists: (userId, params) =>
    api.get(`/playlists/following/${userId}`, { params }),

  // Search
  searchPlaylists: (query, genre) =>
    api.get('/playlists/search', {
      params: { query, genre },
    }),
  searchPrivatePlaylists: (query, userId) =>
    api.get('/playlists/search-private', {
      params: { query, userId },
    }),

  // Cover
  updatePlaylistName: (id, name) =>
    api.patch(`/playlists/${id}/name`, { name }),
  updatePlaylistCover: (id, coverImage) =>
    api.patch(`/playlists/${id}/cover`, {
      coverImage,
    }),
  generateCover: (id) =>
    api.get(`/playlists/${id}/generate-cover`),
};

// ================= MUSIC =================
export const musicAPI = {
  // CRUD
  getAllMusic: (params) =>
    api.get('/music', { params }),
  getMusicById: (id) =>
    api.get(`/music/${id}`),

  // Featured / Popular
  getFeaturedMusic: (limit) =>
    api.get('/music/featured', {
      params: { limit },
    }),
  getPopularMusic: (params) =>
    api.get('/music/popular', { params }),
  getNewReleases: (params) =>
    api.get('/music/new-releases', { params }),

  // Genre / Category
  getMusicByGenre: (genre, params) =>
    api.get(`/music/genre/${genre}`, { params }),
  getMusicByCategory: (category, params) =>
    api.get(`/music/category/${category}`, {
      params,
    }),
  getTop10ByCategory: (genre) =>
    api.get('/music/top10', {
      params: { genre },
    }),
  getGlobalTop10: () =>
    api.get('/music/top10'),

  // Artist
  getMusicByArtist: (artistId, params) =>
    api.get(`/music/artist/${artistId}`, {
      params,
    }),
  getMusicByArtistSlug: (slug, params) =>
    api.get(`/music/artist/slug/${slug}`, {
      params,
    }),

  // Search
  searchMusic: (query) =>
    api.get('/search/musics', {
      params: { query },
    }),
  searchMusicByArtist: (params) =>
    api.get('/music/search/artist', {
      params,
    }),
  searchMusicAndPlaylists: (query) =>
    api.get('/music/search/all', {
      params: { q: query },
    }),
  searchPublicContent: (query) =>
    api.get('/music/search/public', {
      params: { q: query },
    }),
  searchPrivateContent: (query) =>
    api.get('/music/search/private', {
      params: { q: query },
    }),

  // Interactions
  likeMusic: (id) =>
    api.post(`/music/${id}/like`),
  incrementPlayCount: (id) =>
    api.post(`/music/${id}/play`),
  addToPlaylist: (id, playlistId) =>
    api.post(`/music/${id}/add-to-playlist`, {
      playlistId,
    }),

  // Info
  getMusicPlaylistInfo: (id) =>
    api.get(`/music/${id}/playlist-info`),
};

// ================= SEARCH =================
export const searchAPI = {
  searchAll: (query) =>
    api.get('/search', { params: { query, type: 'all' } }),
  searchMusic: (query) =>
    api.get('/search/musics', {
      params: { query },
    }),
  searchPlaylists: (query) =>
    api.get('/search/playlists', {
      params: { query },
    }),
  searchArtists: (query) =>
    api.get('/search/artists', {
      params: { query },
    }),
  searchUsers: (query) =>
    api.get('/search/users', {
      params: { query },
    }),
};

// ================= ARTIST =================
export const artistAPI = {
  getAllArtists: (params) =>
    api.get('/artists', { params }),
  getArtistById: (id) =>
    api.get(`/artists/${id}`),
  getArtistBySlug: (slug) =>
    api.get(`/artists/slug/${slug}`),
  followArtist: (id) =>
    api.post(`/artists/${id}/follow`),
  unfollowArtist: (id) =>
    api.post(`/artists/${id}/unfollow`),
  getFollowedArtists: () =>
    api.get('/artists/followed'),
  claimArtist: (id, data) =>
    api.post(`/artists/${id}/claim`, data),
};

// ================= USER =================
export const userAPI = {
  getProfile: () => api.get('/profile'),
  getUserByUsername: (username) => api.get(`/users/${username}`),
  getUserById: (id) => api.get(`/user/${id}`),
  updateProfile: (data) =>
    api.put('/profile', data),
  uploadProfileImage: (formData) =>
    api.post('/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  uploadAdditionalImage: (formData) =>
    api.post('/upload-additional-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteAdditionalImage: (imageId) =>
    api.delete(`/additional-images/${imageId}`),
  followUser: (userId) =>
    api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) =>
    api.post(`/users/${userId}/unfollow`),
  getFollowers: () =>
    api.get('/profile/followers'),
  getFollowing: () =>
    api.get('/profile/following'),
};

// ================= NOTIFICATION =================
export const notificationAPI = {
  // User notifications
  getUserNotifications: (params) =>
    api.get('/notifications/user', { params }),

  // Register FCM token
  registerToken: (data) =>
    api.post('/notifications/register-token', data),

  // Update notification settings
  updateSettings: (settings) =>
    api.put('/notifications/settings', settings),

  // Deactivate device token
  deactivateToken: (data) =>
    api.post('/notifications/deactivate-token', data),
};

// ================= MESSAGES =================
export const messageAPI = {
  // Konuşma listesini getir
  getConversations: () =>
    api.get('/messages/conversations'),

  // Belirli bir kullanıcı ile konuşmayı getir
  getConversation: (otherUserId, params) =>
    api.get(`/messages/conversation/${otherUserId}`, { params }),

  // Backward compatibility için
  getMessages: (conversationId) =>
    api.get(`/messages/${conversationId}`),

  // Mesaj gönder (REST API fallback)
  sendMessage: (data) =>
    api.post('/messages/send', data),

  // Mesajı okundu işaretle
  markMessageAsRead: (messageId) =>
    api.put(`/messages/read/${messageId}`),

  // Konuşmayı okundu işaretle
  markConversationAsRead: (otherUserId) =>
    api.put(`/messages/conversation/${otherUserId}/read`),

  // Backward compatibility için
  markAsRead: (conversationId) =>
    api.put(`/messages/${conversationId}/read`),

  // Okunmamış mesaj sayısını getir
  getUnreadCount: () =>
    api.get('/messages/unread/count'),

  // Mesaj sil
  deleteMessage: (messageId) =>
    api.delete(`/messages/${messageId}`),

  // Mesaj düzenle
  editMessage: (messageId, data) =>
    api.put(`/messages/${messageId}`, data),

  // Mesaj ara
  searchMessages: (params) =>
    api.get('/messages/search', { params }),
};

// ================= SUBSCRIPTION =================
export const subscriptionAPI = {
  getCurrentSubscription: () =>
    api.get('/subscriptions/current'),
  subscribe: (plan) =>
    api.post('/subscriptions/subscribe', {
      plan,
    }),
  cancelSubscription: () =>
    api.post('/subscriptions/cancel'),
  getPlans: () =>
    api.get('/subscriptions/plans'),
};

// ================= SETTINGS =================
export const settingsAPI = {
  // Platform Preferences
  getPlatformPreferences: () =>
    api.get('/settings/platform-preferences'),
  updatePlatformPreferences: (preferences) =>
    api.put('/settings/platform-preferences', { platformPreferences: preferences }),

  // App Settings
  getAppSettings: () =>
    api.get('/settings/app-settings'),
  updateAppSettings: (settings) =>
    api.put('/settings/app-settings', { appSettings: settings }),

  // All Settings
  getAllSettings: () =>
    api.get('/settings/all'),
};

// ================= ARTIST MUSIC =================
export const artistMusicAPI = {
  getSpotifyMetadata: (trackId) =>
    api.get(`/spotify/track/${trackId}`),
  addMusic: (data) =>
    api.post('/music', data),
  getUserMusic: (params) =>
    api.get('/music', { params }),
  deleteMusic: (musicId) =>
    api.delete(`/music/${musicId}`),
};

// ================= SUPPORT =================
export const supportAPI = {
  // Destek talebi oluştur (giriş yapmış kullanıcılar için)
  createTicket: (data) =>
    api.post('/support/tickets', data),

  // Guest destek talebi oluştur (giriş yapmamış kullanıcılar için - email gerekli)
  // Yanıtlar e-posta ile gönderilecek, panel üzerinden takip yapılmayacak
  createGuestTicket: (data) =>
    publicApi.post('/support/tickets/guest', data),

  // Kullanıcının taleplerini getir
  getMyTickets: () =>
    api.get('/support/tickets'),

  // Tek talep detayı
  getTicketById: (id) =>
    api.get(`/support/tickets/${id}`),

  // Talebe yanıt ver (sadece giriş yapmış kullanıcılar)
  replyToTicket: (id, data) =>
    api.post(`/support/tickets/${id}/reply`, data),

  // Talebi sil
  deleteTicket: (id) =>
    api.delete(`/support/tickets/${id}`),
};

// ================= STORE =================
export const storeAPI = {
  // İlanları getir (sayfalı, filtrelenebilir)
  getListings: (params) =>
    api.get('/store/listings', { params }),

  // Tek ilan detayı
  getListingById: (id) =>
    api.get(`/store/listings/${id}`),

  // Yeni ilan oluştur
  createListing: (formData) =>
    api.post('/store/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // İlan güncelle
  updateListing: (id, formData) =>
    api.put(`/store/listings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // İlan sil
  deleteListing: (id) =>
    api.delete(`/store/listings/${id}`),

  // İlanı yenile (30 gün uzat)
  renewListing: (id) =>
    api.post(`/store/listings/${id}/renew`),

  // Kullanıcının ilanları
  getMyListings: () =>
    api.get('/store/my-listings'),

  // Kullanıcı ilan haklarını getir
  getUserRights: () =>
    api.get('/store/rights'),

  // İlan hakkı satın al
  purchaseRights: (data) =>
    api.post('/store/rights/purchase', data),

  // İlan sahibine iletişim (view artırma)
  contactListing: (id) =>
    api.post(`/store/listings/${id}/contact`),
};

export default api;