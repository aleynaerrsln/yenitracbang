// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Logo ve Sosyal Medya */}
        <div className="footer-section footer-brand">
          <img src="/logo.png" alt="TrackBang" className="footer-logo" />
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaTwitter size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebook size={20} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaYoutube size={20} />
            </a>
          </div>
        </div>

        {/* Link Grupları */}
        <div className="footer-links">
          <div className="footer-column">
            <h4>Şirket</h4>
            <ul>
              <li><Link to="/about">Hakkımızda</Link></li>
              <li><Link to="/careers">Kariyer</Link></li>
              <li><Link to="/press">Basın</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Topluluk</h4>
            <ul>
              <li><Link to="/artists">Sanatçılar</Link></li>
              <li><Link to="/developers">Geliştiriciler</Link></li>
              <li><Link to="/advertising">Reklam</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Bağlantılar</h4>
            <ul>
              <li><Link to="/support">Destek</Link></li>
              <li><Link to="/mobile">Mobil Uygulama</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Yasal</h4>
            <ul>
              <li><Link to="/privacy">Gizlilik Politikası</Link></li>
              <li><Link to="/terms">Kullanım Koşulları</Link></li>
              <li><Link to="/kvkk">KVKK Aydınlatma Metni</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alt Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} TrackBang. Tüm hakları saklıdır.</p>
          <div className="footer-legal-links">
            <Link to="/privacy">Gizlilik Politikası</Link>
            <Link to="/terms">Kullanım Koşulları</Link>
            <Link to="/kvkk">KVKK</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
