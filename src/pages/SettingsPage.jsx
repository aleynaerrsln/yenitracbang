// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import ProfileInfoModal from '../components/modals/ProfileInfoModal';
import EmailChangeModal from '../components/modals/EmailChangeModal';
import PasswordChangeModal from '../components/modals/PasswordChangeModal';
import { FiUser, FiMail, FiLock, FiChevronRight, FiLogOut, FiInfo } from 'react-icons/fi';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [profileInfoModalOpen, setProfileInfoModalOpen] = useState(false);
  const [emailChangeModalOpen, setEmailChangeModalOpen] = useState(false);
  const [passwordChangeModalOpen, setPasswordChangeModalOpen] = useState(false);

  // Platform Preferences State
  const [platformPreferences, setPlatformPreferences] = useState({
    spotify: true,
    appleMusic: true,
  });
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // App Settings State
  const [appSettings, setAppSettings] = useState({
    notificationsEnabled: true,
    newMusicNotifications: true,
    messageNotifications: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      const response = await settingsAPI.getAllSettings();
      console.log('Settings response:', response.data);

      if (response.data.success) {
        const { platformPreferences: prefs, appSettings: settings } = response.data.settings;

        console.log('Platform prefs from backend:', prefs);
        console.log('App settings from backend:', settings);

        setPlatformPreferences({
          spotify: prefs?.spotify ?? true,
          appleMusic: prefs?.appleMusic ?? true,
        });
        setAppSettings({
          notificationsEnabled: settings?.notificationsEnabled ?? true,
          newMusicNotifications: settings?.newMusicNotifications ?? true,
          messageNotifications: settings?.messageNotifications ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoadingPreferences(false);
      setLoadingSettings(false);
    }
  };

  const handlePlatformToggle = async (platform) => {
    const oldPreferences = { ...platformPreferences };
    const newValue = !platformPreferences[platform];

    const newPreferences = {
      ...platformPreferences,
      [platform]: newValue,
    };

    console.log('🔄 Toggling platform:', platform);
    console.log('📤 Sending to backend:', newPreferences);

    // Optimistic update
    setPlatformPreferences(newPreferences);

    try {
      const response = await settingsAPI.updatePlatformPreferences(newPreferences);
      console.log('✅ Update successful:', response.data);
      toast.success(`${platform === 'spotify' ? 'Spotify' : 'Apple Music'} ${newValue ? 'aktif edildi' : 'devre dışı bırakıldı'}`);
    } catch (error) {
      // Rollback on error
      console.error('❌ Update failed:', error.response?.data || error.message);
      setPlatformPreferences(oldPreferences);
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    }
  };

  const handleNotificationsToggle = async (settingKey) => {
    const oldSettings = { ...appSettings };
    const newSettings = {
      ...appSettings,
      [settingKey]: !appSettings[settingKey],
    };

    console.log(`Toggling ${settingKey} to:`, newSettings[settingKey]);

    // Optimistic update
    setAppSettings(newSettings);

    try {
      const response = await settingsAPI.updateAppSettings(newSettings);
      console.log('Update response:', response.data);
      toast.success('Bildirim ayarları güncellendi');
    } catch (error) {
      // Rollback on error
      setAppSettings(oldSettings);
      toast.error('Güncelleme başarısız');
      console.error('Failed to update app settings:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
      toast.success('Başarıyla çıkış yapıldı');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1>Ayarlar</h1>
        </div>

        {/* Account Management Section */}
        <div className="settings-section">
          <h2 className="section-title">Hesap Yönetimi</h2>
          <p className="section-subtitle">
            Hesap bilgilerinizi yönetin
          </p>

          <div className="settings-list">
            {/* Profile Info */}
            <button
              className="setting-item"
              onClick={() => setProfileInfoModalOpen(true)}
            >
              <div className="setting-icon">
                <FiUser size={20} />
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Profil Bilgileri</h3>
                <p className="setting-description">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName} • @${user.username}`
                    : `@${user.username}`}
                </p>
              </div>
              <FiChevronRight size={20} className="setting-arrow" />
            </button>

            {/* Email Address */}
            <button
              className="setting-item"
              onClick={() => setEmailChangeModalOpen(true)}
            >
              <div className="setting-icon">
                <FiMail size={20} />
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Email Adresi</h3>
                <p className="setting-description">
                  {user?.email || 'Email adresi ekle'}
                </p>
              </div>
              <FiChevronRight size={20} className="setting-arrow" />
            </button>

            {/* Password */}
            <button
              className="setting-item"
              onClick={() => setPasswordChangeModalOpen(true)}
            >
              <div className="setting-icon">
                <FiLock size={20} />
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Şifre Değiştir</h3>
                <p className="setting-description">
                  Hesap şifrenizi güncelleyin
                </p>
              </div>
              <FiChevronRight size={20} className="setting-arrow" />
            </button>
          </div>
        </div>

        {/* Platform Preferences Section */}
        <div className="settings-section">
          <h2 className="section-title">Platform Tercihleri</h2>
          <p className="section-subtitle">
            Müzik dinleme alışkanlıklarınızı paylaşın
          </p>

          <div className="settings-list">
            {/* Spotify */}
            <div className="setting-item">
              <div className="setting-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Spotify</h3>
                <p className="setting-description">
                  {platformPreferences.spotify ? 'Aktif' : 'Devre dışı'}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={platformPreferences.spotify}
                  onChange={() => handlePlatformToggle('spotify')}
                  disabled={loadingPreferences}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Apple Music */}
            <div className="setting-item">
              <div className="setting-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#FA243C">
                  <path d="M23.994 6.124c0-.738-.034-1.47-.098-2.198-.065-.765-.171-1.531-.396-2.269-.25-.871-.663-1.654-1.227-2.315-.565-.666-1.279-1.171-2.081-1.523C19.470-.431 18.683-.64 17.884-.756c-.766-.112-1.538-.167-2.308-.198C14.611-.989 13.645-1 12.696-1c-.949 0-1.915.011-2.88.046-.77.031-1.542.086-2.308.198-.799.116-1.586.325-2.308.576-.802.352-1.516.857-2.081 1.523C2.554.909 2.141 1.692 1.891 2.563c-.225.738-.331 1.504-.396 2.269C1.431 5.6 1.397 6.332 1.397 7.07 1.363 8.014 1.352 8.958 1.352 9.902c0 .944.011 1.888.045 2.832.034.738.068 1.47.098 2.198.065.765.171 1.531.396 2.269.25.871.663 1.654 1.227 2.315.565.666 1.279 1.171 2.081 1.523.722.251 1.509.46 2.308.576.766.112 1.538.167 2.308.198.965.035 1.931.046 2.88.046.949 0 1.915-.011 2.88-.046.77-.031 1.542-.086 2.308-.198.799-.116 1.586-.325 2.308-.576.802-.352 1.516-.857 2.081-1.523.564-.661.977-1.444 1.227-2.315.225-.738.331-1.504.396-2.269.03-.728.064-1.46.098-2.198.034-.944.045-1.888.045-2.832 0-.944-.011-1.888-.045-2.832zm-3.568 9.347c-.033.694-.125 1.383-.3 2.056-.192.722-.478 1.396-.93 1.968-.456.577-1.048.998-1.735 1.232-.684.235-1.402.334-2.122.401-.721.067-1.443.102-2.165.118-.95.022-1.9.034-2.851.034-.951 0-1.901-.012-2.851-.034-.722-.016-1.444-.051-2.165-.118-.72-.067-1.438-.166-2.122-.401-.687-.234-1.279-.655-1.735-1.232-.452-.572-.738-1.246-.93-1.968-.175-.673-.267-1.362-.3-2.056-.036-.721-.053-1.443-.071-2.165-.024-.95-.036-1.9-.036-2.851 0-.951.012-1.901.036-2.851.018-.722.035-1.444.071-2.165.033-.694.125-1.383.3-2.056.192-.722.478-1.396.93-1.968.456-.577 1.048-.998 1.735-1.232.684-.235 1.402-.334 2.122-.401.721-.067 1.443-.102 2.165-.118.95-.022 1.9-.034 2.851-.034.951 0 1.901.012 2.851.034.722.016 1.444.051 2.165.118.72.067 1.438.166 2.122.401.687.234 1.279.655 1.735 1.232.452.572.738 1.246.93 1.968.175.673.267 1.362.3 2.056.036.721.053 1.443.071 2.165.024.95.036 1.9.036 2.851 0 .951-.012 1.901-.036 2.851-.018.722-.035 1.444-.071 2.165z"/>
                </svg>
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Apple Music</h3>
                <p className="setting-description">
                  {platformPreferences.appleMusic ? 'Aktif' : 'Devre dışı'}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={platformPreferences.appleMusic}
                  onChange={() => handlePlatformToggle('appleMusic')}
                  disabled={loadingPreferences}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <h2 className="section-title">Bildirimler</h2>
          <p className="section-subtitle">
            Hangi bildirimleri almak istersiniz?
          </p>

          <div className="settings-list">
            {/* Main Notifications Toggle */}
            <div className="setting-item">
              <div className="setting-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Bildirimleri Aç</h3>
                <p className="setting-description">
                  {appSettings.notificationsEnabled ? 'Bildirimler aktif' : 'Bildirimler kapalı'}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={appSettings.notificationsEnabled}
                  onChange={() => handleNotificationsToggle('notificationsEnabled')}
                  disabled={loadingSettings}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* New Music Notifications */}
            <div className="setting-item">
              <div className="setting-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Yeni Müzik</h3>
                <p className="setting-description">
                  {appSettings.newMusicNotifications ? 'Yeni müzik bildirimleri aktif' : 'Yeni müzik bildirimleri kapalı'}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={appSettings.newMusicNotifications}
                  onChange={() => handleNotificationsToggle('newMusicNotifications')}
                  disabled={loadingSettings || !appSettings.notificationsEnabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Message Notifications */}
            <div className="setting-item">
              <div className="setting-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Mesajlar</h3>
                <p className="setting-description">
                  {appSettings.messageNotifications ? 'Mesaj bildirimleri aktif' : 'Mesaj bildirimleri kapalı'}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={appSettings.messageNotifications}
                  onChange={() => handleNotificationsToggle('messageNotifications')}
                  disabled={loadingSettings || !appSettings.notificationsEnabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Session Section */}
        <div className="settings-section">
          <h2 className="section-title">Oturum</h2>
          <p className="section-subtitle">
            Hesap oturumunuzu yönetin
          </p>

          <div className="settings-list">
            <button
              className="setting-item logout-item"
              onClick={handleLogout}
            >
              <div className="setting-icon logout-icon">
                <FiLogOut size={20} />
              </div>
              <div className="setting-content">
                <h3 className="setting-title logout-text">Çıkış Yap</h3>
                <p className="setting-description">
                  Hesabınızdan güvenli şekilde çıkış yapın
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <h2 className="section-title">Hakkında</h2>
          <p className="section-subtitle">
            Uygulama bilgileri ve dökümanlar
          </p>

          <div className="settings-list">
            {/* Version */}
            <div className="setting-item">
              <div className="setting-icon">
                <FiInfo size={20} />
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Versiyon</h3>
                <p className="setting-description">
                  v0.0.0
                </p>
              </div>
            </div>

            {/* Privacy Policy */}
            <button
              className="setting-item"
              onClick={() => window.open('/privacy-policy', '_blank')}
            >
              <div className="setting-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Gizlilik Politikası</h3>
                <p className="setting-description">
                  Gizlilik politikamızı okuyun
                </p>
              </div>
              <FiChevronRight size={20} className="setting-arrow" />
            </button>

            {/* Terms of Use */}
            <button
              className="setting-item"
              onClick={() => window.open('/terms-of-use', '_blank')}
            >
              <div className="setting-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className="setting-content">
                <h3 className="setting-title">Kullanım Koşulları</h3>
                <p className="setting-description">
                  Kullanım koşullarımızı okuyun
                </p>
              </div>
              <FiChevronRight size={20} className="setting-arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileInfoModal
        isOpen={profileInfoModalOpen}
        onClose={() => setProfileInfoModalOpen(false)}
      />

      <EmailChangeModal
        isOpen={emailChangeModalOpen}
        onClose={() => setEmailChangeModalOpen(false)}
      />

      <PasswordChangeModal
        isOpen={passwordChangeModalOpen}
        onClose={() => setPasswordChangeModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
