// src/pages/AboutUsPage.jsx

import { FiMail, FiGlobe, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './AboutUsPage.css';

const AboutUsPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();

  const content = {
    tr: {
      title: 'Hakkımızda',
      version: 'Versiyon 1.0.0',
      whoWeAre: 'Biz Kimiz',
      whoWeAreText: 'TrackBang, DJ\'ler, müzik yapımcıları ve elektronik müzik tutkunları için özel olarak tasarlanmış kapsamlı bir müzik platformudur. Misyonumuz, müziği keşfetmek, düzenlemek ve paylaşmak için kaliteli araçlar ve kaynaklar sağlamaktır.',
      whoWeAreText2: 'Elektronik müzik kültürüne olan tutkuyla kurulan TrackBang, kaliteli ses ve sanatsal ifadeye aynı tutkuyla bağlı müzik severlerin bir topluluğunu bir araya getirir.',
      ourMission: 'Misyonumuz',
      ourMissionText: 'Sanatçıları ve müzik severleri yaratıcı yolculuklarını geliştiren yenilikçi araçlarla güçlendirmeye inanıyoruz. TrackBang şunları sunar:',
      features: [
        '• Seçkin müzik keşfi',
        '• Profesyonel düzeyde organizasyon araçları',
        '• Kesintisiz müzik paylaşım yetenekleri',
        '• Topluluk odaklı playlistler',
        '• Sanatçı profili ve ağ oluşturma',
        '• Etkinlik listeleri ve tanıtım'
      ],
      contact: 'Bize Ulaşın',
      contactText: 'Sorularınız veya geri bildiriminiz var mı? Sizden haber almak isteriz!',
      email: 'E-posta',
      website: 'Website',
      emailValue: 'support@trackbang.com',
      websiteValue: 'www.trackbang.com',
      followText: 'En son güncellemeler ve müzik önerileri için bizi sosyal medyada takip edin.',
      websiteBtn: 'Website',
      emailBtn: 'Email',
      legal: 'Yasal',
      privacyPolicy: 'Gizlilik Politikası',
      termsOfService: 'Hizmet Şartları',
      kvkk: 'KVKK (Veri Koruma)',
      copyright: '© 2026 TrackBang. Tüm hakları saklıdır.',
      madeWith: 'Türkiye\'de ❤️ ile yapıldı'
    },
    en: {
      title: 'About Us',
      version: 'Version 1.0.0',
      whoWeAre: 'Who We Are',
      whoWeAreText: 'TrackBang is a comprehensive music platform designed specifically for DJs, music producers, and electronic music enthusiasts. Our mission is to provide quality tools and resources for discovering, organizing, and sharing music.',
      whoWeAreText2: 'Founded with a passion for electronic music culture, TrackBang brings together a community of music lovers who share the same dedication to quality sound and artistic expression.',
      ourMission: 'Our Mission',
      ourMissionText: 'We believe in empowering artists and music lovers with innovative tools that enhance their creative journey. TrackBang offers:',
      features: [
        '• Curated music discovery',
        '• Professional-grade organization tools',
        '• Seamless music sharing capabilities',
        '• Community-driven playlists',
        '• Artist profile and networking',
        '• Event listings and promotion'
      ],
      contact: 'Contact Us',
      contactText: 'Have questions or feedback? We\'d love to hear from you!',
      email: 'Email',
      website: 'Website',
      emailValue: 'support@trackbang.com',
      websiteValue: 'www.trackbang.com',
      followText: 'Follow us on social media for the latest updates and music recommendations.',
      websiteBtn: 'Website',
      emailBtn: 'Email',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      kvkk: 'KVKK (Data Protection)',
      copyright: '© 2026 TrackBang. All rights reserved.',
      madeWith: 'Made with ❤️ in Turkey'
    }
  };

  const t = content[language];

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@trackbang.com';
  };

  const handleWebsiteClick = () => {
    window.open('https://www.trackbang.com', '_blank');
  };

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header with Logo */}
        <div className="about-header">
          <div className="about-logo-container">
            <img src="/logo.png" alt="TrackBang" className="about-logo" />
          </div>
          <h1 className="about-brand">TrackBang</h1>
          <p className="about-version">{t.version}</p>

          {/* Language Toggle Button - Moved here */}
          <button className="language-toggle-inline" onClick={toggleLanguage}>
            <FiGlobe size={18} />
            <span>{language === 'tr' ? 'English' : 'Türkçe'}</span>
          </button>
        </div>

        {/* Who We Are Section */}
        <div className="about-section">
          <h2 className="section-title">{t.whoWeAre}</h2>
          <p className="section-text">{t.whoWeAreText}</p>
          <p className="section-text">{t.whoWeAreText2}</p>
        </div>

        {/* Our Mission Section */}
        <div className="about-section">
          <h2 className="section-title">{t.ourMission}</h2>
          <p className="section-text">{t.ourMissionText}</p>
          <ul className="about-features">
            {t.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        {/* Contact Us Section */}
        <div className="about-section">
          <h2 className="section-title">{t.contact}</h2>
          <p className="section-text">{t.contactText}</p>

          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">{t.email}:</span>
              <span className="contact-value">{t.emailValue}</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">{t.website}:</span>
              <span className="contact-value">{t.websiteValue}</span>
            </div>
          </div>

          <p className="section-text follow-text">{t.followText}</p>

          <div className="contact-buttons">
            <button className="contact-btn website-btn" onClick={handleWebsiteClick}>
              <FiGlobe size={20} />
              <span>{t.websiteBtn}</span>
            </button>
            <button className="contact-btn email-btn" onClick={handleEmailClick}>
              <FiMail size={20} />
              <span>{t.emailBtn}</span>
            </button>
          </div>
        </div>

        {/* Legal Section */}
        <div className="about-section legal-section">
          <h2 className="section-title">{t.legal}</h2>

          <button className="legal-item" onClick={() => navigate('/privacy')}>
            <span>{t.privacyPolicy}</span>
            <FiChevronRight size={20} />
          </button>

          <button className="legal-item" onClick={() => navigate('/terms')}>
            <span>{t.termsOfService}</span>
            <FiChevronRight size={20} />
          </button>

          <button className="legal-item" onClick={() => navigate('/kvkk')}>
            <span>{t.kvkk}</span>
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <p className="copyright">{t.copyright}</p>
          <p className="made-with">{t.madeWith}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
