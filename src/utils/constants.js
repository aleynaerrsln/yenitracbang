// src/utils/constants.js

export const GENRES = [
  { 
    key: 'afrohouse', 
    name: 'Afro House', 
    color: '#FF6B35',
    image: '/assets/genres/afrohouse.jpg'
  },
  { 
    key: 'indiedance', 
    name: 'Indie Dance', 
    color: '#E91E63',
    image: '/assets/genres/indiedance.jpg'
  },
  { 
    key: 'organichouse', 
    name: 'Organic House', 
    color: '#4CAF50',
    image: '/assets/genres/organichouse.jpg'
  },
  { 
    key: 'downtempo', 
    name: 'Down Tempo', 
    color: '#2196F3',
    image: '/assets/genres/downtempo.jpg'
  },
  { 
    key: 'melodichouse', 
    name: 'Melodic House', 
    color: '#9C27B0',
    image: '/assets/genres/melodichouse.jpg'
  },
];

export const PLATFORMS = {
  spotify: {
    name: 'Spotify',
    icon: '🎵',
    color: '#1DB954',
  },
  appleMusic: {
    name: 'Apple Music',
    icon: '🎵',
    color: '#FA243C',
  },
  youtubeMusic: {
    name: 'YouTube Music',
    icon: '▶️',
    color: '#FF0000',
  },
  beatport: {
    name: 'Beatport',
    icon: '🎧',
    color: '#01FF95',
  },
  soundcloud: {
    name: 'SoundCloud',
    icon: '☁️',
    color: '#FF5500',
  },
};

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];