// src/context/LanguageContext.jsx - Global Language Management
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Load from localStorage or default to Turkish
    return localStorage.getItem('app_language') || 'tr';
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem('app_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isEnglish: language === 'en',
    isTurkish: language === 'tr',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
