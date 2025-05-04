
import { useLanguage } from '@/i18n/LanguageContext';

export function useTranslation() {
  const { language, t } = useLanguage();
  
  return {
    t: (key: string) => {
      // يدعم الطريقة الجديدة للترجمة باستخدام النقطة مثل 'common.home'
      const parts = key.includes('.') ? key.split('.') : ['common', key];
      const section = parts[0];
      const subKey = parts[1];
      return t(section, subKey);
    },
    language
  };
}
