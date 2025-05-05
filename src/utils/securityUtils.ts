/**
 * وحدة لتأمين التطبيق بشكل عام
 * توفر وظائف أمان عامة للتطبيق
 */

import secureStorage from "./secureStorage";
import secureApi from "./secureApi";
import secureExcel from "./secureExcel";
import secureIO from "./secureIO";
import secureFiles from "./secureFiles";
import secureCommunication from "./secureCommunication";
import { supabase } from "@/integrations/supabase/client";

/**
 * التحقق من صلاحيات المستخدم
 * @param requiredRole الدور المطلوب
 * @returns وعد بنتيجة التحقق
 */
export const checkUserPermission = async (requiredRole: 'admin' | 'owner'): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return false;

    const { data: userData, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !userData) return false;

    if (requiredRole === 'owner') {
      return userData.role === 'owner';
    }

    return userData.role === 'admin' || userData.role === 'owner';
  } catch (error) {
    console.error('فشل في التحقق من صلاحيات المستخدم:', error);
    return false;
  }
};

/**
 * التحقق من حالة تسجيل الدخول
 * @returns وعد بحالة تسجيل الدخول
 */
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('فشل في التحقق من حالة تسجيل الدخول:', error);
    return false;
  }
};

/**
 * الحصول على معلومات المستخدم الحالي
 * @returns وعد بمعلومات المستخدم
 */
export const getCurrentUser = async (): Promise<any> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;

    const { data: userData, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) throw error;

    return userData;
  } catch (error) {
    console.error('فشل في الحصول على معلومات المستخدم:', error);
    return null;
  }
};

/**
 * تسجيل الخروج بشكل آمن
 * @returns وعد بنتيجة تسجيل الخروج
 */
export const secureLogout = async (): Promise<void> => {
  try {
    // تسجيل الخروج من Supabase
    await supabase.auth.signOut();

    // مسح البيانات المخزنة محليًا
    secureStorage.removeItem('session_token');

    // مسح البيانات الحساسة الأخرى
    const sensitiveKeys = [
      'user_data',
      'auth_data',
      'token',
      'credentials',
      'session'
    ];

    sensitiveKeys.forEach(key => {
      secureStorage.removeItem(key);
    });
  } catch (error) {
    console.error('فشل في تسجيل الخروج:', error);
    throw new Error('فشل في تسجيل الخروج: ' + (error as Error).message);
  }
};

/**
 * تأمين التطبيق عند بدء التشغيل
 */
export const secureAppInitialization = (): void => {
  try {
    // إضافة معالج للأخطاء غير المعالجة
    window.addEventListener('error', (event) => {
      console.error('خطأ غير معالج:', event.error);

      // لا نمنع الأخطاء من الظهور في وضع التطوير
      if (import.meta.env.PROD) {
        event.preventDefault();
      }
    });

    // إضافة معالج للوعود المرفوضة غير المعالجة
    window.addEventListener('unhandledrejection', (event) => {
      console.error('وعد مرفوض غير معالج:', event.reason);

      // لا نمنع الأخطاء من الظهور في وضع التطوير
      if (import.meta.env.PROD) {
        event.preventDefault();
      }
    });

    // إضافة رؤوس أمان إضافية في وضع الإنتاج فقط
    if (typeof document !== 'undefined' && import.meta.env.PROD) {
      // إضافة سياسة أمان المحتوى مع السماح ببعض الميزات الضرورية
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.mapbox.com; worker-src 'self' blob:;";
      document.head.appendChild(meta);

      // إضافة سياسة X-Frame-Options
      const xFrameOptions = document.createElement('meta');
      xFrameOptions.httpEquiv = 'X-Frame-Options';
      xFrameOptions.content = 'DENY';
      document.head.appendChild(xFrameOptions);

      // إضافة سياسة X-XSS-Protection
      const xssProtection = document.createElement('meta');
      xssProtection.httpEquiv = 'X-XSS-Protection';
      xssProtection.content = '1; mode=block';
      document.head.appendChild(xssProtection);
    }
  } catch (error) {
    console.error('فشل في تأمين التطبيق عند بدء التشغيل:', error);
  }
};

// تصدير جميع وحدات الأمان
export default {
  secureStorage,
  secureApi,
  secureExcel,
  secureIO,
  secureFiles,
  secureCommunication,
  checkUserPermission,
  isLoggedIn,
  getCurrentUser,
  secureLogout,
  secureAppInitialization
};
