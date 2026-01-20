// src/App.jsx - LIBRARY ROUTE EKLENDİ

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
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
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import KVKK from './pages/KVKK';
import AboutUsPage from './pages/AboutUsPage';
import HelpSupportPage from './pages/HelpSupportPage';
import StorePage from './pages/StorePage';
import CreateListingPage from './pages/CreateListingPage';
import ListingDetailPage from './pages/ListingDetailPage';
import MessagesPage from './pages/MessagesPage';
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
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        {/* Sözleşme sayfaları giriş yapmadan erişilebilir */}
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/kvkk" element={<KVKK />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <>
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
          <Route path="/store" element={<StorePage />} />
          <Route path="/store/create" element={<CreateListingPage />} />
          <Route path="/store/:id" element={<ListingDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />
          <Route path="/artist-essential" element={<ArtistEssential />} />
          <Route path="/artist/:slug" element={<ArtistPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;