// استيراد وحدات الأمان (يجب أن تكون أول استيرادات)
import './utils/disableConsoleInProduction';
import './utils/disableDevTools';
import securityUtils from './utils/securityUtils';

// تأمين التطبيق عند بدء التشغيل
securityUtils.secureAppInitialization();

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './i18n/LanguageContext'

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
