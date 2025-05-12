// استيراد وحدات الأمان (يجب أن تكون أول استيرادات)
import './utils/disableConsoleInProduction';
import './utils/disableDevTools';
import securityUtils from './utils/securityUtils';
import { UserLocationProvider } from './hooks/useUserLocation';

// تأمين التطبيق عند بدء التشغيل
securityUtils.secureAppInitialization();

import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './i18n/LanguageContext'

// تحسين أداء التحميل الأولي
const root = document.getElementById("root");
if (!root) throw new Error('Root element not found');

// استخدام StrictMode في وضع التطوير فقط
const app = process.env.NODE_ENV === 'development' ? (
  <StrictMode>
    <LanguageProvider>
      <UserLocationProvider>
        <App />
      </UserLocationProvider>
    </LanguageProvider>
  </StrictMode>
) : (
  <LanguageProvider>
    <UserLocationProvider>
      <App />
    </UserLocationProvider>
  </LanguageProvider>
);

createRoot(root).render(app);
