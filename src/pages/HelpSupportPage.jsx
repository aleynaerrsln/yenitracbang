// src/pages/HelpSupportPage.jsx

import { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiChevronUp, FiMessageSquare, FiMail, FiGlobe, FiClock, FiPhone, FiX, FiPlus, FiTrash2, FiSend, FiLogIn } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supportAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import './HelpSupportPage.css';

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Bu sayfa için kendi dil state'i - varsayılan İngilizce
  const [language, setLanguage] = useState('en');
  const toggleLanguage = () => setLanguage(prev => prev === 'tr' ? 'en' : 'tr');

  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef(null);

  // Ticket form state
  const [ticketForm, setTicketForm] = useState({
    category: 'general',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

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
      responseTime: 'Yanıt süresi: 24-48 saat',
      // Modal
      createSupportTicket: 'Destek Talebi Oluştur',
      category: 'Kategori',
      subject: 'Konu',
      message: 'Mesaj',
      subjectPlaceholder: 'Sorununuzu kısaca açıklayın',
      messagePlaceholder: 'Sorununuzu detaylı olarak açıklayın...',
      submitTicket: 'Talebi Gönder',
      categories: {
        general: 'Genel',
        billing: 'Fatura',
        bug: 'Hata Raporu',
        suggestion: 'Öneri',
        account: 'Hesap',
        other: 'Diğer'
      },
      ticketStatus: {
        open: 'Açık',
        in_progress: 'İşlemde',
        resolved: 'Çözüldü',
        closed: 'Kapatıldı'
      },
      ticketCreated: 'Destek talebiniz oluşturuldu',
      ticketError: 'Talep oluşturulamadı',
      deleteTicket: 'Talebi Sil',
      ticketDeleted: 'Talep silindi',
      viewDetails: 'Detayları Gör',
      adminResponse: 'Destek Yanıtı',
      yourMessage: 'Sizin Mesajınız',
      supportTeam: 'Yanıtınız',
      replyPlaceholder: 'Yanıtınızı yazın...',
      sendReply: 'Gönder',
      waitingForReply: 'Destek ekibinin yanıtını bekliyorsunuz...',
      replySent: 'Yanıtınız gönderildi',
      canReplyNow: 'Yanıt verebilirsiniz'
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
      responseTime: 'Response time: 24-48 hours',
      // Modal
      createSupportTicket: 'Create Support Ticket',
      category: 'Category',
      subject: 'Subject',
      message: 'Message',
      subjectPlaceholder: 'Brief description of your issue',
      messagePlaceholder: 'Please describe your issue in detail...',
      submitTicket: 'Submit Ticket',
      categories: {
        general: 'General',
        billing: 'Billing',
        bug: 'Bug Report',
        suggestion: 'Suggestion',
        account: 'Account',
        other: 'Other'
      },
      ticketStatus: {
        open: 'Open',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        closed: 'Closed'
      },
      ticketCreated: 'Your support ticket has been created',
      ticketError: 'Failed to create ticket',
      deleteTicket: 'Delete Ticket',
      ticketDeleted: 'Ticket deleted',
      viewDetails: 'View Details',
      adminResponse: 'Support Response',
      yourMessage: 'Your Message',
      supportTeam: 'Your Reply',
      replyPlaceholder: 'Write your reply...',
      sendReply: 'Send',
      waitingForReply: 'Waiting for support team response...',
      replySent: 'Your reply has been sent',
      canReplyNow: 'You can reply now'
    }
  };

  const t = content[language];

  // Talepleri yükle ve periyodik güncelle (sadece giriş yapmışsa)
  useEffect(() => {
    if (!isLoggedIn) return;

    fetchTickets();

    // Her 30 saniyede talepleri güncelle (sayfa açıkken)
    const listPollInterval = setInterval(() => {
      fetchTickets();
    }, 30000);

    return () => clearInterval(listPollInterval);
  }, [isLoggedIn]);

  // Mesajlar değiştiğinde en alta kaydır
  useEffect(() => {
    if (selectedTicket && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket]);

  // Ticket açıkken polling ile güncelle (her 5 saniyede)
  useEffect(() => {
    if (!selectedTicket || !isLoggedIn) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await supportAPI.getTicketById(selectedTicket._id);
        if (response.data.ticket) {
          const newTicket = response.data.ticket;
          // Sadece mesaj sayısı değiştiyse güncelle
          if (newTicket.messages?.length !== selectedTicket.messages?.length) {
            setSelectedTicket(newTicket);
            // Liste'yi de güncelle
            fetchTickets();
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // 5 saniyede bir kontrol et

    return () => clearInterval(pollInterval);
  }, [selectedTicket?._id, selectedTicket?.messages?.length, isLoggedIn]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await supportAPI.getMyTickets();
      if (response.data.tickets) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Talepler yüklenemedi:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleTopicClick = (topic) => {
    setTicketForm(prev => ({ ...prev, category: topic }));
    setShowTicketModal(true);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();

    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast.error(language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);
      await supportAPI.createTicket(ticketForm);
      toast.success(t.ticketCreated);
      setShowTicketModal(false);
      setTicketForm({ category: 'general', subject: '', message: '' });
      fetchTickets();
    } catch (error) {
      const errorMsg = error.response?.data?.error || t.ticketError;
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await supportAPI.deleteTicket(ticketId);
      toast.success(t.ticketDeleted);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Hata oluştu');
    }
  };

  // Kullanıcı yanıt gönder
  const handleSendReply = async () => {
    if (!replyText.trim() || sendingReply) return;

    try {
      setSendingReply(true);
      const response = await supportAPI.replyToTicket(selectedTicket._id, { message: replyText.trim() });

      if (response.data.success) {
        toast.success(t.replySent);
        setReplyText('');
        // Ticket'ı güncelle
        setSelectedTicket(response.data.ticket);
        // Liste'yi de güncelle
        fetchTickets();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Yanıt gönderilemedi';
      toast.error(errorMsg);
    } finally {
      setSendingReply(false);
    }
  };

  // Kullanıcı yanıt verebilir mi kontrol et
  const canUserReply = () => {
    if (!selectedTicket) return false;
    if (selectedTicket.status === 'closed') return false;

    // Mesaj yoksa yanıt veremez (ilk mesaj zaten ticket.message)
    if (!selectedTicket.messages || selectedTicket.messages.length === 0) {
      return false; // Admin henüz yanıt vermedi
    }

    // Son mesaj admin'den mi kontrol et
    const lastMessage = selectedTicket.messages[selectedTicket.messages.length - 1];
    return lastMessage.sender === 'admin';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'tr' ? 'Şimdi' : 'Just now';
    if (diffMins < 60) return `${diffMins}${language === 'tr' ? 'd önce' : 'm ago'}`;
    if (diffHours < 24) return `${diffHours}${language === 'tr' ? 's önce' : 'h ago'}`;
    if (diffDays < 7) return `${diffDays}${language === 'tr' ? 'g önce' : 'd ago'}`;

    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#fbbf24';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Ticket detay modalını açtığında
  const handleOpenTicketDetail = async (ticket) => {
    try {
      // Güncel ticket bilgisini al
      const response = await supportAPI.getTicketById(ticket._id);
      if (response.data.ticket) {
        setSelectedTicket(response.data.ticket);
      } else {
        setSelectedTicket(ticket);
      }
    } catch (error) {
      setSelectedTicket(ticket);
    }
    setReplyText('');
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

        {/* My Tickets Section - Only for logged in users */}
        {isLoggedIn ? (
          <div className="tickets-section">
            <div className="section-header">
              <FiMessageSquare size={20} />
              <h3>{t.myTickets}</h3>
            </div>

            {loadingTickets ? (
              <div className="tickets-loading">
                <div className="spinner"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="no-tickets">
                <FiMessageSquare size={48} />
                <p className="no-tickets-title">{t.noTickets}</p>
                <p className="no-tickets-subtitle">{t.createTicket}</p>
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="ticket-item"
                    onClick={() => handleOpenTicketDetail(ticket)}
                  >
                    <div className="ticket-header">
                      <span className="ticket-category">
                        {t.categories[ticket.category] || ticket.category}
                      </span>
                      <span
                        className="ticket-status"
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {t.ticketStatus[ticket.status] || ticket.status}
                      </span>
                    </div>
                    <h4 className="ticket-subject">{ticket.subject}</h4>
                    <p className="ticket-message">{ticket.message}</p>
                    <span className="ticket-date">{formatTime(ticket.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="login-required-section">
            <div className="login-required-content">
              <FiLogIn size={40} />
              <h3>{language === 'tr' ? 'Destek Talebi Oluşturmak İçin' : 'To Create Support Ticket'}</h3>
              <p>{language === 'tr' ? 'Destek talebi oluşturmak ve taleplerinizi takip etmek için giriş yapmanız gerekmektedir.' : 'You need to login to create support tickets and track your requests.'}</p>
              <button className="login-btn" onClick={() => navigate('/auth')}>
                <FiLogIn size={18} />
                <span>{language === 'tr' ? 'Giriş Yap' : 'Login'}</span>
              </button>
            </div>
          </div>
        )}

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

        {/* New Ticket Button - Only for logged in users */}
        {isLoggedIn && (
          <button className="new-ticket-btn" onClick={() => setShowTicketModal(true)}>
            <FiPlus size={20} />
            <span>{t.newTicket}</span>
          </button>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="ticket-modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-modal-header">
              <h2>{t.createSupportTicket}</h2>
              <button className="modal-close-btn" onClick={() => setShowTicketModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="ticket-form">
              <div className="form-group">
                <label>{t.category}</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="general">{t.categories.general}</option>
                  <option value="billing">{t.categories.billing}</option>
                  <option value="bug">{t.categories.bug}</option>
                  <option value="suggestion">{t.categories.suggestion}</option>
                  <option value="account">{t.categories.account}</option>
                  <option value="other">{t.categories.other}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t.subject}</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={t.subjectPlaceholder}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>{t.message}</label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={t.messagePlaceholder}
                  rows={5}
                  maxLength={1000}
                />
              </div>

              <button
                type="submit"
                className="submit-ticket-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="spinner-small"></div>
                ) : (
                  t.submitTicket
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal - Chat Style */}
      {selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal ticket-chat-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="ticket-chat-header">
              <div className="ticket-chat-info">
                <h2>{selectedTicket.subject}</h2>
                <div className="ticket-chat-meta">
                  <span
                    className="ticket-status"
                    style={{ backgroundColor: getStatusColor(selectedTicket.status) }}
                  >
                    {t.ticketStatus[selectedTicket.status] || selectedTicket.status}
                  </span>
                  <span className="ticket-category">
                    {t.categories[selectedTicket.category] || selectedTicket.category}
                  </span>
                </div>
              </div>
              <div className="ticket-chat-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTicket(selectedTicket._id)}
                  title={t.deleteTicket}
                >
                  <FiTrash2 size={18} />
                </button>
                <button className="close-btn" onClick={() => setSelectedTicket(null)}>
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="ticket-chat-messages">
              {/* İlk mesaj (ticket oluşturulurken yazılan) */}
              <div className="chat-message user-message">
                <div className="message-label">{t.yourMessage}</div>
                <div className="message-bubble">
                  <p>{selectedTicket.message}</p>
                </div>
                <span className="message-time">{formatTime(selectedTicket.createdAt)}</span>
              </div>

              {/* Sonraki mesajlar */}
              {selectedTicket.messages && selectedTicket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${msg.sender === 'admin' ? 'admin-message' : 'user-message'}`}
                >
                  <div className="message-label">
                    {msg.sender === 'admin' ? t.supportTeam : t.yourMessage}
                  </div>
                  <div className="message-bubble">
                    <p>{msg.message}</p>
                  </div>
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer - Reply Input or Waiting Message */}
            <div className="ticket-chat-footer">
              {selectedTicket.status === 'closed' ? (
                <div className="ticket-closed-notice">
                  {language === 'tr' ? 'Bu talep kapatılmış.' : 'This ticket is closed.'}
                </div>
              ) : canUserReply() ? (
                <div className="reply-input-container">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t.replyPlaceholder}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    disabled={sendingReply}
                  />
                  <button
                    className="send-reply-btn"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                  >
                    {sendingReply ? (
                      <div className="spinner-small"></div>
                    ) : (
                      <FiSend size={18} />
                    )}
                  </button>
                </div>
              ) : (
                <div className="waiting-notice">
                  <FiClock size={16} />
                  <span>{t.waitingForReply}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupportPage;
