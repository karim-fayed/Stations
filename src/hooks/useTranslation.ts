
import { useLanguage } from '@/i18n/LanguageContext';

export function useTranslation() {
  const { t } = useLanguage();
  
  return {
    t: (key: string) => {
      const [section = 'common', subKey = key] = key.includes('.') ? key.split('.') : ['common', key];
      return t(section, subKey);
    }
  };
}
