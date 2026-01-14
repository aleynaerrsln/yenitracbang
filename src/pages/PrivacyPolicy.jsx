// src/pages/PrivacyPolicy.jsx - Mobil Uygulamadaki Gerçek İçerik
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './LegalPage.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const isEnglish = language === 'en';

  // Sayfa yüklendiğinde en üste scroll yap
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const englishContent = `1. INTRODUCTION

TrackBang ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.

Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.

2. INFORMATION WE COLLECT

2.1 Personal Data
We may collect personally identifiable information, such as:
• Name and surname
• Email address
• Phone number
• Username and password
• Profile picture
• Location data (with your permission)
• Payment information (processed securely through third-party providers)

2.2 Usage Data
We automatically collect certain information when you use the app:
• Device information (model, operating system, unique device identifiers)
• IP address
• App usage statistics
• Listening history and preferences
• Playlists and favorites
• Search queries

2.3 Audio Data
• Music files you upload
• Playlists you create
• Comments and interactions

3. HOW WE USE YOUR INFORMATION

We use the collected information for:
• Providing and maintaining our services
• Personalizing your experience
• Processing transactions
• Sending notifications and updates
• Analyzing usage patterns to improve our services
• Preventing fraud and ensuring security
• Complying with legal obligations
• Communicating with you about products, services, and events

4. DATA SHARING AND DISCLOSURE

We may share your information with:
• Service providers who assist in our operations
• Business partners for joint offerings
• Legal authorities when required by law
• Other users (only information you choose to make public)

We do NOT sell your personal information to third parties.

5. DATA SECURITY

We implement appropriate technical and organizational measures to protect your personal data, including:
• SSL/TLS encryption for data transmission
• Secure server infrastructure
• Regular security audits
• Access controls and authentication
• Data backup and recovery procedures

6. DATA RETENTION

We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.

7. YOUR RIGHTS

You have the right to:
• Access your personal data
• Correct inaccurate data
• Delete your data
• Export your data
• Opt-out of marketing communications
• Withdraw consent at any time

8. CHILDREN'S PRIVACY

Our services are not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.

9. INTERNATIONAL DATA TRANSFERS

Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.

10. CHANGES TO THIS POLICY

We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.

11. CONTACT US

If you have questions about this Privacy Policy, please contact us at:
Email: privacy@trackbang.com
Address: TrackBang, Körfez Mahallesi, Adnan Menderes Bulvarı No:9/51, 55270 Atakum/Samsun, Turkey

12. CONSENT

By using our application, you consent to our Privacy Policy and agree to its terms.`;

  const turkishContent = `1. GİRİŞ

TrackBang ("biz," "bizim" veya "tarafımızca") gizliliğinizi korumayı taahhüt eder. Bu Gizlilik Politikası, mobil uygulamamızı ve hizmetlerimizi kullanırken bilgilerinizi nasıl topladığımızı, kullandığımızı, ifşa ettiğimizi ve koruduğumuzu açıklamaktadır.

Lütfen bu gizlilik politikasını dikkatlice okuyunuz. Bu gizlilik politikasının şartlarını kabul etmiyorsanız, lütfen uygulamaya erişmeyiniz.

2. TOPLADIĞIMIZ BİLGİLER

2.1 Kişisel Veriler
Aşağıdaki kişisel tanımlayıcı bilgileri toplayabiliriz:
• Ad ve soyad
• E-posta adresi
• Telefon numarası
• Kullanıcı adı ve şifre
• Profil fotoğrafı
• Konum verileri (izniniz dahilinde)
• Ödeme bilgileri (üçüncü taraf sağlayıcılar aracılığıyla güvenli şekilde işlenir)

2.2 Kullanım Verileri
Uygulamayı kullandığınızda belirli bilgiler otomatik olarak toplanır:
• Cihaz bilgileri (model, işletim sistemi, benzersiz cihaz tanımlayıcıları)
• IP adresi
• Uygulama kullanım istatistikleri
• Dinleme geçmişi ve tercihler
• Çalma listeleri ve favoriler
• Arama sorguları

2.3 Ses Verileri
• Yüklediğiniz müzik dosyaları
• Oluşturduğunuz çalma listeleri
• Yorumlar ve etkileşimler

3. BİLGİLERİNİZİ NASIL KULLANIRIZ

Toplanan bilgileri şu amaçlarla kullanırız:
• Hizmetlerimizin sağlanması ve sürdürülmesi
• Deneyiminizin kişiselleştirilmesi
• İşlemlerin gerçekleştirilmesi
• Bildirimler ve güncellemeler gönderilmesi
• Hizmetlerimizi geliştirmek için kullanım kalıplarının analiz edilmesi
• Dolandırıcılığın önlenmesi ve güvenliğin sağlanması
• Yasal yükümlülüklere uyum
• Ürünler, hizmetler ve etkinlikler hakkında sizinle iletişim

4. VERİ PAYLAŞIMI VE İFŞASI

Bilgilerinizi şu taraflarla paylaşabiliriz:
• Operasyonlarımıza yardımcı olan hizmet sağlayıcılar
• Ortak teklifler için iş ortakları
• Kanunen gerekli olduğunda yasal merciler
• Diğer kullanıcılar (yalnızca kamuya açık yapmayı seçtiğiniz bilgiler)

Kişisel bilgilerinizi üçüncü taraflara SATMIYORUZ.

5. VERİ GÜVENLİĞİ

Kişisel verilerinizi korumak için aşağıdakiler dahil uygun teknik ve organizasyonel önlemler uyguluyoruz:
• Veri iletimi için SSL/TLS şifrelemesi
• Güvenli sunucu altyapısı
• Düzenli güvenlik denetimleri
• Erişim kontrolleri ve kimlik doğrulama
• Veri yedekleme ve kurtarma prosedürleri

6. VERİ SAKLAMA

Kişisel verilerinizi yalnızca bu politikada belirtilen amaçları yerine getirmek için gerekli olduğu sürece saklarız, ancak kanun tarafından daha uzun bir saklama süresi gerekmedikçe.

7. HAKLARINIZ

Aşağıdaki haklara sahipsiniz:
• Kişisel verilerinize erişim
• Yanlış verilerin düzeltilmesi
• Verilerinizin silinmesi
• Verilerinizin dışa aktarılması
• Pazarlama iletişimlerinden çıkma
• Onayı istediğiniz zaman geri çekme

8. ÇOCUKLARIN GİZLİLİĞİ

Hizmetlerimiz 13 yaşın altındaki kullanıcılara yönelik değildir. 13 yaşın altındaki çocuklardan bilerek kişisel bilgi toplamayız.

9. ULUSLARARASI VERİ TRANSFERLERİ

Bilgileriniz kendi ülkeniz dışındaki ülkelere aktarılabilir ve işlenebilir. Bu tür transferler için uygun güvencelerin mevcut olduğundan emin oluruz.

10. BU POLİTİKADAKİ DEĞİŞİKLİKLER

Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Yeni politikayı bu sayfada yayınlayarak ve "Son Güncelleme" tarihini güncelleyerek herhangi bir değişikliği size bildireceğiz.

11. BİZİMLE İLETİŞİM

Bu Gizlilik Politikası hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
E-posta: privacy@trackbang.com
Adres: TrackBang, Körfez Mahallesi, Adnan Menderes Bulvarı No:9/51, 55270 Atakum/Samsun, Türkiye

12. ONAY

Uygulamamızı kullanarak, Gizlilik Politikamıza onay vermiş ve şartlarını kabul etmiş olursunuz.`;

  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="back-button-top" onClick={() => navigate(-1)}>
          ← {isEnglish ? 'Back' : 'Geri'}
        </button>

        <div className="legal-title-section">
          <h1>{isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası'}</h1>
          <button className="language-toggle-content" onClick={toggleLanguage}>
            <FiGlobe size={16} />
            <span>{isEnglish ? 'Türkçe' : 'English'}</span>
          </button>
        </div>

        <p className="last-updated">
          {isEnglish ? 'Last Updated: January 4, 2026' : 'Son Güncelleme: 4 Ocak 2026'}
        </p>

        <div className="legal-content">
          {(isEnglish ? englishContent : turkishContent).split('\n').map((line, index) => {
            if (line.trim() === '') {
              return <br key={index} />;
            }
            if (line.match(/^\d+\./)) {
              return <h2 key={index}>{line}</h2>;
            }
            if (line.match(/^\d+\.\d+/)) {
              return <h3 key={index}>{line}</h3>;
            }
            if (line.startsWith('•')) {
              return <li key={index}>{line.substring(1).trim()}</li>;
            }
            return <p key={index}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
