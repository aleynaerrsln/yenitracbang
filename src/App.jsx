// src/App.jsx - LIBRARY ROUTE EKLENDİ

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import Auth from './pages/Auth';
import MainContent from './components/layout/MainContent';
import PlaylistDetail from './pages/PlaylistDetail';
import MyPlaylistDetail from './pages/MyPlaylistDetail';
import GenreDetail from './pages/GenreDetail';
import Library from './pages/Library';
import ListsPage from './pages/ListsPage';
import Top10Page from './pages/Top10Page';
import WorldPage from './pages/WorldPage';
import HotPage from './pages/HotPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import ArtistEssential from './pages/ArtistEssential';
import ArtistPage from './pages/ArtistPage';
import NotFound from './pages/NotFound';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<Navigate to={`/profile/${user.username}`} replace />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
        <Route path="/my-playlist/:id" element={<MyPlaylistDetail />} />
        <Route path="/genre/:slug" element={<GenreDetail />} />
        <Route path="/library" element={<Library />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/top10" element={<Top10Page />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/hot" element={<HotPage />} />
        <Route path="/artist-essential" element={<ArtistEssential />} />
        <Route path="/artist/:slug" element={<ArtistPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;