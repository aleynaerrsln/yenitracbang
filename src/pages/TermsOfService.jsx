// src/pages/TermsOfService.jsx - Mobil Uygulamadaki Gerçek İçerik
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './LegalPage.css';

const TermsOfService = () => {
  const navigate = useNavigate();
  const { isEnglish, toggleLanguage } = useLanguage();

  const englishContent = `1. AGREEMENT TO TERMS

By accessing or using TrackBang mobile application and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Services.

2. ELIGIBILITY

You must be at least 13 years old to use our Services. By using our Services, you represent and warrant that you meet this age requirement.

3. USER ACCOUNTS

3.1 Account Creation
To access certain features, you must create an account. You agree to:
• Provide accurate, current, and complete information
• Maintain and update your information
• Keep your password confidential
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized access

3.2 Account Termination
We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.

4. ACCEPTABLE USE

You agree NOT to:
• Violate any applicable laws or regulations
• Infringe on intellectual property rights
• Upload harmful, offensive, or illegal content
• Harass, abuse, or harm other users
• Attempt to gain unauthorized access to our systems
• Use automated methods to access the Services
• Interfere with the proper functioning of the Services
• Impersonate others or misrepresent your affiliation
• Collect user information without consent
• Use the Services for commercial purposes without authorization

5. INTELLECTUAL PROPERTY

5.1 Our Content
All content, features, and functionality of the Services are owned by TrackBang and are protected by copyright, trademark, and other intellectual property laws.

5.2 User Content
You retain ownership of content you upload. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of providing our Services.

5.3 Copyright Infringement
We respect intellectual property rights. If you believe your content has been infringed, please contact us at: copyright@trackbang.com

6. SUBSCRIPTIONS AND PAYMENTS

6.1 Subscription Plans
We offer various subscription plans with different features and pricing. Details are available within the app.

6.2 Billing
• Subscriptions are billed in advance on a recurring basis
• You authorize us to charge your payment method
• Prices are subject to change with notice
• All fees are non-refundable unless otherwise stated

6.3 Cancellation
You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period.

7. DISCLAIMERS

THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.

8. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRACKBANG SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF THE SERVICES.

9. INDEMNIFICATION

You agree to indemnify and hold harmless TrackBang and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Services or violation of these Terms.

10. GOVERNING LAW

These Terms shall be governed by and construed in accordance with the laws of the Republic of Turkey, without regard to its conflict of law provisions.

11. DISPUTE RESOLUTION

Any disputes arising from these Terms shall be resolved through:
1. Good faith negotiations
2. Mediation
3. Binding arbitration or courts in Turkey

12. CHANGES TO TERMS

We reserve the right to modify these Terms at any time. We will notify users of material changes. Continued use of the Services after changes constitutes acceptance of the new Terms.

13. SEVERABILITY

If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in effect.

14. ENTIRE AGREEMENT

These Terms constitute the entire agreement between you and TrackBang regarding the Services.

15. CONTACT INFORMATION

For questions about these Terms, contact us at:
Email: legal@trackbang.com
Address: TrackBang, Körfez Mahallesi, Adnan Menderes Bulvarı No:9/51, 55270 Atakum/Samsun, Turkey

By using TrackBang, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.`;

  const turkishContent = `1. ŞARTLARIN KABULÜ

TrackBang mobil uygulamasına ve hizmetlerine ("Hizmetler") erişerek veya bunları kullanarak, bu Kullanım Koşullarına ("Koşullar") bağlı olmayı kabul etmiş olursunuz. Bu koşulların herhangi bir kısmına katılmıyorsanız, Hizmetlere erişmeyebilirsiniz.

2. EHLİYET

Hizmetlerimizi kullanmak için en az 13 yaşında olmalısınız. Hizmetlerimizi kullanarak, bu yaş şartını karşıladığınızı beyan ve taahhüt edersiniz.

3. KULLANICI HESAPLARI

3.1 Hesap Oluşturma
Belirli özelliklere erişmek için bir hesap oluşturmanız gerekir. Aşağıdakileri kabul edersiniz:
• Doğru, güncel ve eksiksiz bilgi sağlamak
• Bilgilerinizi güncel tutmak
• Şifrenizi gizli tutmak
• Hesabınız altındaki tüm faaliyetlerin sorumluluğunu kabul etmek
• Yetkisiz erişimi derhal bize bildirmek

3.2 Hesap Sonlandırma
Bu Koşulları ihlal eden hesapları askıya alma veya sonlandırma hakkını veya kendi takdirimize bağlı olarak herhangi bir nedenle saklı tutarız.

4. KABUL EDİLEBİLİR KULLANIM

Aşağıdakileri YAPMAMAYÍ kabul edersiniz:
• Geçerli yasaları veya düzenlemeleri ihlal etmek
• Fikri mülkiyet haklarını ihlal etmek
• Zararlı, saldırgan veya yasadışı içerik yüklemek
• Diğer kullanıcıları taciz etmek, kötüye kullanmak veya zarar vermek
• Sistemlerimize yetkisiz erişim sağlamaya çalışmak
• Hizmetlere erişmek için otomatik yöntemler kullanmak
• Hizmetlerin düzgün işleyişine müdahale etmek
• Başkalarını taklit etmek veya bağlılığınızı yanlış temsil etmek
• Onay olmadan kullanıcı bilgilerini toplamak
• Hizmetleri yetki olmadan ticari amaçlarla kullanmak

5. FİKRİ MÜLKİYET

5.1 Bizim İçeriğimiz
Hizmetlerin tüm içeriği, özellikleri ve işlevselliği TrackBang'e aittir ve telif hakkı, ticari marka ve diğer fikri mülkiyet yasalarıyla korunmaktadır.

5.2 Kullanıcı İçeriği
Yüklediğiniz içeriğin mülkiyetini korursunuz. İçerik yükleyerek, Hizmetlerimizi sağlamak amacıyla içeriğinizi kullanmak, çoğaltmak, değiştirmek ve dağıtmak için bize münhasır olmayan, dünya çapında, telifsiz bir lisans verirsiniz.

5.3 Telif Hakkı İhlali
Fikri mülkiyet haklarına saygı duyuyoruz. İçeriğinizin ihlal edildiğine inanıyorsanız, lütfen bizimle iletişime geçin: copyright@trackbang.com

6. ABONELİKLER VE ÖDEMELER

6.1 Abonelik Planları
Farklı özellikler ve fiyatlandırma ile çeşitli abonelik planları sunuyoruz. Ayrıntılar uygulama içinde mevcuttur.

6.2 Faturalandırma
• Abonelikler yinelenen bazda önceden faturalandırılır
• Ödeme yönteminizi borçlandırmamıza yetki verirsiniz
• Fiyatlar bildirimle değişebilir
• Aksi belirtilmedikçe tüm ücretler iade edilmez

6.3 İptal
Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal, mevcut faturalandırma döneminin sonunda yürürlüğe girer.

7. SORUMLULUK REDDİ

HİZMETLER, AÇIK VEYA ZIMNİ HERHANGİ BİR GARANTİ OLMAKSIZIN "OLDUĞU GİBİ" VE "MEVCUT OLDUĞU ŞEKİLDE" SAĞLANMAKTADIR. HİZMETLERİN KESİNTİSİZ, GÜVENLİ VEYA HATASIZ OLACAĞINI GARANTİ ETMİYORUZ.

8. SORUMLULUK SINIRLAMASI

KANUNUN İZİN VERDİĞİ AZAMİ ÖLÇÜDE, TRACKBANG, HİZMETLERİ KULLANIMINIZDAN KAYNAKLANAN HERHANGİ BİR DOLAYLI, ARIZİ, ÖZEL, SONUÇSAL VEYA CEZAİ ZARARDAN SORUMLU OLMAYACAKTIR.

9. TAZMİNAT

Hizmetleri kullanımınızdan veya bu Koşulları ihlal etmenizden kaynaklanan herhangi bir talep, zarar, kayıp veya masraftan TrackBang'i ve yetkililerini, yöneticilerini, çalışanlarını ve temsilcilerini tazmin etmeyi ve zararsız tutmayı kabul edersiniz.

10. UYGULANACAK HUKUK

Bu Koşullar, kanun ihtilafı hükümleri dikkate alınmaksızın Türkiye Cumhuriyeti yasalarına göre yönetilecek ve yorumlanacaktır.

11. UYUŞMAZLIK ÇÖZÜMÜ

Bu Koşullardan kaynaklanan herhangi bir uyuşmazlık şu yollarla çözülecektir:
1. İyi niyetli müzakereler
2. Arabuluculuk
3. Türkiye'deki bağlayıcı tahkim veya mahkemeler

12. KOŞULLARDA DEĞİŞİKLİKLER

Bu Koşulları istediğimiz zaman değiştirme hakkını saklı tutarız. Önemli değişiklikleri kullanıcılara bildireceğiz. Değişikliklerden sonra Hizmetlerin kullanılmaya devam edilmesi, yeni Koşulların kabulünü oluşturur.

13. BÖLÜNEBİLİRLİK

Bu Koşulların herhangi bir hükmünün uygulanamaz olduğu tespit edilirse, kalan hükümler yürürlükte kalmaya devam edecektir.

14. BÜTÜN ANLAŞMA

Bu Koşullar, Hizmetlerle ilgili olarak siz ve TrackBang arasındaki bütün anlaşmayı oluşturur.

15. İLETİŞİM BİLGİLERİ

Bu Koşullar hakkında sorularınız için bizimle iletişime geçin:
E-posta: legal@trackbang.com
Adres: TrackBang, Körfez Mahallesi, Adnan Menderes Bulvarı No:9/51, 55270 Atakum/Samsun, Türkiye

TrackBang'i kullanarak, bu Kullanım Koşullarını okuduğunuzu, anladığınızı ve bunlara bağlı olmayı kabul ettiğinizi onaylarsınız.`;

  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Geri
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {isEnglish ? 'TR' : 'EN'}
          </button>
        </div>

        <h1>{isEnglish ? 'Terms of Service' : 'Kullanım Koşulları'}</h1>
        <p className="last-updated">
          {isEnglish ? 'January 4, 2026' : '4 Ocak 2026'}
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

export default TermsOfService;
