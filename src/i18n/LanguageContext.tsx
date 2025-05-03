
import React, { createContext, useContext, useState } from 'react';
import { translations } from './translations';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (section: string, key: string) => string;
  dir: 'rtl' | 'ltr';
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: () => '',
  dir: 'rtl',
});

// Create provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  // Translation function
  const t = (section: string, key: string): string => {
    try {
      if (translations[section] && translations[section][key]) {
        return translations[section][key][language] || key;
      }
      console.warn(`Translation missing for ${section}.${key}`);
      return key;
    } catch (error) {
      console.error(`Error in translation for ${section}.${key}:`, error);
      return key;
    }
  };

  // Determine text direction based on language
  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create hook for using the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
