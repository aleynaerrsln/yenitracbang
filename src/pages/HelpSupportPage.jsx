// src/pages/HelpSupportPage.jsx

import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMessageSquare, FiMail, FiGlobe, FiClock, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './HelpSupportPage.css';

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const content = {
    tr: {
      title: 'Yardım & Destek',
      helpTitle: 'Nasıl yardımcı olabiliriz?',
      helpSubtitle: 'Bir konu seçin veya destek talebi oluşturun',
      billing: 'Fatura',
      bugReport: 'Hata Raporu',
      suggestion: 'Öneri',
      other: 'Diğer',
      faqTitle: 'Sık Sorulan Sorular',
      newTicket: 'Yeni Talep',
      faqs: [
        {
          question: 'Aboneliğimi nasıl yükseltebilirim?',
          answer: 'Ayarlar > Abonelik bölümüne gidin ve tercih ettiğiniz planı seçin. Ödeme, ödeme sağlayıcımız aracılığıyla güvenli bir şekilde işlenecektir.'
        },
        {
          question: 'Aboneliğimi iptal edebilir miyim?',
          answer: 'Evet, Ayarlar > Abonelik bölümünden istediğiniz zaman iptal edebilirsiniz. Erişiminiz fatura döneminizin sonuna kadar devam edecektir.'
        },
        {
          question: 'Müzik nasıl yüklerim?',
          answer: 'Doğrulanmış bir sanatçı olarak, profil sayfanızdan müzik yükleyebilirsiniz. "Yükle" butonuna tıklayın ve yükleme sihirbazını takip edin.'
        },
        {
          question: 'Doğrulanmış sanatçı nasıl olurum?',
          answer: 'Sanatçı bilgileriniz ve sosyal medya bağlantılarınızla destek talep sistemi üzerinden bize ulaşın. Ekibimiz başvurunuzu inceleyecektir.'
        },
        {
          question: 'Verilerim güvende mi?',
          answer: 'Evet, verilerinizi korumak için endüstri standardı şifreleme ve güvenlik önlemleri kullanıyoruz. Daha fazla bilgi için Gizlilik Politikamızı okuyun.'
        }
      ],
      myTickets: 'Taleplerim',
      noTickets: 'Henüz talep yok',
      createTicket: 'Yardıma ihtiyacınız varsa bir talep oluşturun',
      contactUs: 'Bize Ulaşın',
      email: 'support@trackbang.com',
      website: 'www.trackbang.com',
      responseTime: 'Yanıt süresi: 24-48 saat'
    },
    en: {
      title: 'Help & Support',
      helpTitle: 'How can we help you?',
      helpSubtitle: 'Choose a topic or create a support ticket',
      billing: 'Billing',
      bugReport: 'Bug Report',
      suggestion: 'Suggestion',
      other: 'Other',
      faqTitle: 'Frequently Asked Questions',
      newTicket: 'New Ticket',
      faqs: [
        {
          question: 'How do I upgrade my subscription?',
          answer: 'Go to Settings > Subscription and choose your preferred plan. Payment will be processed securely through our payment provider.'
        },
        {
          question: 'Can I cancel my subscription?',
          answer: 'Yes, you can cancel anytime from Settings > Subscription. Your access will continue until the end of your billing period.'
        },
        {
          question: 'How do I upload music?',
          answer: 'As a verified artist, you can upload music from your profile page. Click the "Upload" button and follow the upload wizard.'
        },
        {
          question: 'How do I become a verified artist?',
          answer: 'Contact us through the support ticket system with your artist information and social media links. Our team will review your application.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for more details.'
        }
      ],
      myTickets: 'My Tickets',
      noTickets: 'No tickets yet',
      createTicket: 'Create a ticket if you need help',
      contactUs: 'Contact Us',
      email: 'support@trackbang.com',
      website: 'www.trackbang.com',
      responseTime: 'Response time: 24-48 hours'
    }
  };

  const t = content[language];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleTopicClick = (topic) => {
    // Handle topic selection for creating ticket
    console.log('Selected topic:', topic);
  };

  return (
    <div className="help-support-page">
      <div className="help-support-container">
        {/* Header with Language Toggle */}
        <div className="help-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className="help-title">{t.title}</h1>
          <button className="language-toggle-help" onClick={toggleLanguage}>
            <FiGlobe size={18} />
            <span>{language === 'tr' ? 'EN' : 'TR'}</span>
          </button>
        </div>

        {/* Help Topics Section */}
        <div className="help-topics-section">
          <h2 className="topics-title">{t.helpTitle}</h2>
          <p className="topics-subtitle">{t.helpSubtitle}</p>

          <div className="topics-grid">
            <button className="topic-card" onClick={() => handleTopicClick('billing')}>
              <FiClock size={32} />
              <span>{t.billing}</span>
            </button>
            <button className="topic-card" onClick={() => handleTopicClick('bug')}>
              <FiMessageSquare size={32} />
              <span>{t.bugReport}</span>
            </button>
            <button className="topic-card" onClick={() => handleTopicClick('suggestion')}>
              <FiMessageSquare size={32} />
              <span>{t.suggestion}</span>
            </button>
            <button className="topic-card" onClick={() => handleTopicClick('other')}>
              <FiMessageSquare size={32} />
              <span>{t.other}</span>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <FiMessageSquare size={20} />
            <h3>{t.faqTitle}</h3>
          </div>

          <div className="faq-list">
            {t.faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  {expandedFaq === index ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* My Tickets Section */}
        <div className="tickets-section">
          <div className="section-header">
            <FiMessageSquare size={20} />
            <h3>{t.myTickets}</h3>
          </div>

          <div className="no-tickets">
            <FiMessageSquare size={48} />
            <p className="no-tickets-title">{t.noTickets}</p>
            <p className="no-tickets-subtitle">{t.createTicket}</p>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="contact-section">
          <div className="section-header">
            <FiPhone size={20} />
            <h3>{t.contactUs}</h3>
          </div>

          <div className="contact-list">
            <div className="contact-row">
              <FiMail size={18} />
              <span>{t.email}</span>
            </div>
            <div className="contact-row">
              <FiGlobe size={18} />
              <span>{t.website}</span>
            </div>
            <div className="contact-row">
              <FiClock size={18} />
              <span>{t.responseTime}</span>
            </div>
          </div>
        </div>

        {/* New Ticket Button */}
        <button className="new-ticket-btn">
          <span>+</span>
          <span>{t.newTicket}</span>
        </button>
      </div>
    </div>
  );
};

export default HelpSupportPage;
