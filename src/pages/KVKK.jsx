// src/pages/KVKK.jsx - KVKK Aydınlatma Metni (Mobil Uygulamadaki Gerçek İçerik)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './LegalPage.css';

const KVKK = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const isEnglish = language === 'en';

  // Sayfa yüklendiğinde en üste scroll yap
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const turkishContent = `KİŞİSEL VERİLERİN KORUNMASI KANUNU KAPSAMINDA AYDINLATMA METNİ

1. VERİ SORUMLUSU

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu olarak TrackBang tarafından aşağıda açıklanan kapsamda işlenebilecektir.

2. KİŞİSEL VERİLERİN İŞLENME AMACI

Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:

• Üyelik işlemlerinin gerçekleştirilmesi
• Hizmetlerimizin sunulması ve iyileştirilmesi
• Kullanıcı deneyiminin kişiselleştirilmesi
• İletişim faaliyetlerinin yürütülmesi
• Yasal yükümlülüklerin yerine getirilmesi
• Güvenlik ve dolandırıcılık önleme
• İstatistiksel analizler ve raporlama
• Pazarlama ve kampanya faaliyetleri (onayınız dahilinde)

3. İŞLENEN KİŞİSEL VERİLER

Aşağıdaki kategorilerde kişisel veriler işlenmektedir:

Kimlik Bilgileri: Ad, soyad, kullanıcı adı
İletişim Bilgileri: E-posta adresi, telefon numarası
Hesap Bilgileri: Şifre (şifrelenmiş), profil fotoğrafı
Kullanım Verileri: Dinleme geçmişi, playlist'ler, beğeniler
Cihaz Bilgileri: IP adresi, cihaz modeli, işletim sistemi
Konum Bilgileri: Genel konum (izniniz dahilinde)
Ödeme Bilgileri: Ödeme geçmişi (kart bilgileri saklanmaz)

4. KİŞİSEL VERİLERİN AKTARILMASI

Kişisel verileriniz aşağıdaki taraflara aktarılabilir:

• Hizmet sağlayıcılar (hosting, ödeme işlemcileri)
• İş ortakları (gizlilik sözleşmesi kapsamında)
• Yasal zorunluluk halinde yetkili merciler
• Grup şirketleri (varsa)

Verileriniz yurt dışına aktarılabilir. Bu durumda KVKK'nın 9. maddesi kapsamında gerekli önlemler alınır.

5. KİŞİSEL VERİ TOPLAMA YÖNTEMİ VE HUKUKİ SEBEBİ

Kişisel verileriniz;
• Mobil uygulama üzerinden
• Web sitesi üzerinden
• E-posta ve diğer iletişim kanalları üzerinden

otomatik veya otomatik olmayan yollarla toplanmaktadır.

Hukuki Sebepler:
• Sözleşmenin kurulması ve ifası (KVKK m.5/2-c)
• Yasal yükümlülük (KVKK m.5/2-ç)
• Meşru menfaat (KVKK m.5/2-f)
• Açık rıza (KVKK m.5/1)

6. KİŞİSEL VERİ SAHİBİNİN HAKLARI

KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:

a) Kişisel verilerinizin işlenip işlenmediğini öğrenme
b) İşlenmişse buna ilişkin bilgi talep etme
c) İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
d) Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
e) Eksik veya yanlış işlenmişse düzeltilmesini isteme
f) KVKK m.7 kapsamında silinmesini veya yok edilmesini isteme
g) Düzeltme, silme, yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme
h) İşlenen verilerin analiz edilmesiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
ı) Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme

7. VERİ GÜVENLİĞİ

Kişisel verilerinizin güvenliği için:
• SSL/TLS şifreleme kullanılmaktadır
• Düzenli güvenlik denetimleri yapılmaktadır
• Erişim kontrolleri uygulanmaktadır
• Çalışanlar gizlilik konusunda eğitilmektedir

8. VERİ SAKLAMA SÜRESİ

Kişisel verileriniz, işleme amaçları için gerekli olan süre boyunca saklanır. Yasal zorunluluklar saklıdır.

9. BAŞVURU YÖNTEMİ

Haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:

E-posta: kvkk@trackbang.com
Adres: TrackBang, Körfez Mahallesi, Adnan Menderes Bulvarı No:9/51, 55270 Atakum/Samsun, Türkiye

Başvurular en geç 30 gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kurul tarafından belirlenen tarife uygulanır.

10. DEĞİŞİKLİKLER

Bu aydınlatma metni gerektiğinde güncellenebilir. Güncellemeler uygulama üzerinden duyurulacaktır.

Son Güncelleme: 4 Ocak 2026`;

  const englishContent = `PERSONAL DATA PROTECTION NOTICE UNDER KVKK (Turkish Personal Data Protection Law)

1. DATA CONTROLLER

In accordance with Law No. 6698 on the Protection of Personal Data ("KVKK"), your personal data may be processed by TrackBang as the data controller within the scope explained below.

2. PURPOSE OF PROCESSING PERSONAL DATA

Your personal data is processed for the following purposes:

• Performing membership procedures
• Providing and improving our services
• Personalizing user experience
• Conducting communication activities
• Fulfilling legal obligations
• Security and fraud prevention
• Statistical analysis and reporting
• Marketing and campaign activities (with your consent)

3. PERSONAL DATA PROCESSED

Personal data is processed in the following categories:

Identity Information: Name, surname, username
Contact Information: Email address, phone number
Account Information: Password (encrypted), profile photo
Usage Data: Listening history, playlists, likes
Device Information: IP address, device model, operating system
Location Information: General location (with your permission)
Payment Information: Payment history (card details are not stored)

4. TRANSFER OF PERSONAL DATA

Your personal data may be transferred to the following parties:

• Service providers (hosting, payment processors)
• Business partners (under confidentiality agreements)
• Authorized authorities when legally required
• Group companies (if any)

Your data may be transferred abroad. In this case, necessary measures are taken within the scope of Article 9 of KVKK.

5. METHOD AND LEGAL BASIS OF PERSONAL DATA COLLECTION

Your personal data is collected:
• Through the mobile application
• Through the website
• Through email and other communication channels

automatically or non-automatically.

Legal Bases:
• Establishment and performance of contract (KVKK Art.5/2-c)
• Legal obligation (KVKK Art.5/2-ç)
• Legitimate interest (KVKK Art.5/2-f)
• Explicit consent (KVKK Art.5/1)

6. RIGHTS OF THE DATA SUBJECT

Pursuant to Article 11 of KVKK, you have the following rights:

a) To learn whether your personal data is processed
b) To request information if it has been processed
c) To learn the purpose of processing and whether it is used appropriately
d) To know the third parties to whom it is transferred domestically or abroad
e) To request correction if processed incompletely or incorrectly
f) To request deletion or destruction within the scope of KVKK Art.7
g) To request notification of correction, deletion, destruction operations to third parties
h) To object to a result arising against you through analysis of processed data
i) To claim compensation in case of damage due to unlawful processing

7. DATA SECURITY

For the security of your personal data:
• SSL/TLS encryption is used
• Regular security audits are conducted
• Access controls are implemented
• Employees are trained on confidentiality

8. DATA RETENTION PERIOD

Your personal data is retained for as long as necessary for processing purposes. Legal requirements are reserved.

9. APPLICATION METHOD

You can apply through the following methods to exercise your rights:

Email: kvkk@trackbang.com
Address: TrackBang, Körfez Mahallesi, Adnan Menderes Bulvarı No:9/51, 55270 Atakum/Samsun, Turkey

Applications are concluded free of charge within 30 days at the latest. If the transaction requires an additional cost, the tariff determined by the Board is applied.

10. CHANGES

This disclosure text may be updated when necessary. Updates will be announced through the application.

Last Update: January 4, 2026`;

  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="back-button-top" onClick={() => navigate(-1)}>
          ← {isEnglish ? 'Back' : 'Geri'}
        </button>

        <div className="legal-title-section">
          <h1>{isEnglish ? 'KVKK Data Protection Notice' : 'KVKK Aydınlatma Metni'}</h1>
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
            if (line.match(/^[a-ıİ]\)/)) {
              return <li key={index}>{line}</li>;
            }
            if (line.startsWith('•')) {
              return <li key={index}>{line.substring(1).trim()}</li>;
            }
            if (line.includes(':') && !line.includes('@')) {
              const [label, ...rest] = line.split(':');
              return (
                <p key={index}>
                  <strong>{label}:</strong>
                  {rest.join(':')}
                </p>
              );
            }
            return <p key={index}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

export default KVKK;
