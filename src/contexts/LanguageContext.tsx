'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { id } from '@/locales/id';
import { en } from '@/locales/en';

type Language = 'id' | 'en';
type Dictionary = typeof id;

interface LanguageContextProps {
  language: Language;
  t: Dictionary;
  toggleLanguage: () => void;
  formatCurrency: (price: number) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const EXCHANGE_RATE = 18000; // 1 USD = 18,000 IDR (Static for simplicity)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem('radha_lang') as Language;
    if (storedLang === 'en' || storedLang === 'id') {
      setLanguage(storedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'id' ? 'en' : 'id';
    setLanguage(newLang);
    localStorage.setItem('radha_lang', newLang);
  };

  const t = language === 'id' ? id : en;

  const formatCurrency = (price: number) => {
    if (language === 'en') {
      const priceInUSD = price / EXCHANGE_RATE;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(priceInUSD);
    } else {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }
  };

  // To prevent hydration mismatch, you could return a loader or invisible content,
  // but for SEO it's better to just render with default language and let it swap client-side.
  
  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, formatCurrency }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
