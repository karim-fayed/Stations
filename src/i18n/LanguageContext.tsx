
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Language, translations, TranslationSchema } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof TranslationSchema, key: string, params?: Record<string, string | number>) => string;
  dir: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // استخدام اللغة المخزنة في localStorage أو اللغة العربية كافتراضي
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage === Language.ENGLISH ? Language.ENGLISH : Language.ARABIC;
  });

  // تحديث اتجاه الصفحة عند تغيير اللغة
  useEffect(() => {
    document.documentElement.dir = language === Language.ARABIC ? 'rtl' : 'ltr';
    document.documentElement.lang = language === Language.ARABIC ? 'ar' : 'en';
    localStorage.setItem('language', language);
  }, [language]);

  // تغيير اللغة
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // دالة الترجمة المحسنة
  const t = (section: keyof TranslationSchema, key: string, params?: Record<string, string | number>): string => {
    const sectionData = translations[language][section] as Record<string, string>;
    
    if (!sectionData || !sectionData[key]) {
      console.warn(`Missing translation: ${String(section)}.${key} for language ${language}`);
      return `${String(section)}.${key}`;
    }
    
    let text = sectionData[key];
    
    // استبدال المعلمات في النص
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    
    return text;
  };

  // اتجاه النص
  const dir = language === Language.ARABIC ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook لاستخدام سياق اللغة
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
