/**
 * مدير الجلسات - يتعامل مع جلسات المستخدم وتسجيل الخروج التلقائي
 * 
 * يوفر وظائف لإدارة جلسات المستخدم، بما في ذلك:
 * - تسجيل الخروج التلقائي عند إغلاق المتصفح أو التبويب
 * - الحفاظ على الجلسة عند تحديث الصفحة
 * - التعامل مع انتهاء صلاحية الجلسة
 */

import { supabase } from "@/integrations/supabase/client";
import secureStorage from "./secureStorage";
import logger from "@/utils/logger";

// مفتاح لتخزين معرف الجلسة في التخزين المحلي
const SESSION_ID_KEY = 'noor_session_id';

// مفتاح لتخزين وقت آخر نشاط في التخزين المحلي
const LAST_ACTIVITY_KEY = 'noor_last_activity';

// مفتاح لتخزين حالة تسجيل الدخول في sessionStorage (يتم مسحه عند إغلاق المتصفح/التبويب)
const SESSION_STORAGE_KEY = 'noor_browser_session';

/**
 * إنشاء معرف جلسة فريد
 * @returns معرف الجلسة
 */
const generateSessionId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * تهيئة مدير الجلسات
 * يجب استدعاء هذه الوظيفة عند تسجيل الدخول
 */
export const initializeSession = async (): Promise<void> => {
  try {
    // التحقق من وجود جلسة نشطة
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      logger.debug('لا توجد جلسة نشطة');
      return;
    }
    
    // إنشاء معرف جلسة جديد
    const sessionId = generateSessionId();
    
    // تخزين معرف الجلسة في التخزين المحلي
    secureStorage.setItem(SESSION_ID_KEY, sessionId, true);
    
    // تخزين وقت آخر نشاط
    secureStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString(), true);
    
    // تخزين حالة تسجيل الدخول في sessionStorage (يتم مسحه عند إغلاق المتصفح/التبويب)
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    
    // إضافة مستمع لأحداث إغلاق المتصفح/التبويب
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // إضافة مستمع لأحداث تحديث الصفحة
    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    logger.debug('تم تهيئة مدير الجلسات');
  } catch (error) {
    logger.error('خطأ في تهيئة مدير الجلسات:', error);
  }
};

/**
 * معالجة حدث قبل إغلاق المتصفح/التبويب
 * @param event حدث beforeunload
 */
const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
  // لا نقوم بتسجيل الخروج هنا لأن الحدث beforeunload يتم تشغيله أيضًا عند تحديث الصفحة
  // بدلاً من ذلك، نعتمد على sessionStorage الذي يتم مسحه تلقائيًا عند إغلاق المتصفح/التبويب
};

/**
 * معالجة حدث تغيير رؤية الصفحة
 */
const handleVisibilityChange = (): void => {
  if (document.visibilityState === 'visible') {
    // تحديث وقت آخر نشاط عند العودة إلى الصفحة
    secureStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString(), true);
  }
};

/**
 * التحقق من حالة الجلسة عند تحميل الصفحة
 * يجب استدعاء هذه الوظيفة عند تحميل التطبيق
 */
export const checkSessionOnLoad = async (): Promise<boolean> => {
  try {
    // التحقق من وجود جلسة نشطة في Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      logger.debug('لا توجد جلسة نشطة في Supabase');
      return false;
    }
    
    // التحقق من وجود حالة تسجيل الدخول في sessionStorage
    const browserSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!browserSession) {
      // إذا لم تكن هناك حالة تسجيل دخول في sessionStorage، فهذا يعني أن المتصفح/التبويب تم إغلاقه وإعادة فتحه
      logger.debug('تم إغلاق المتصفح/التبويب وإعادة فتحه، تسجيل الخروج تلقائيًا');
      
      // تسجيل الخروج تلقائيًا
      await supabase.auth.signOut();
      
      // مسح بيانات الجلسة
      clearSessionData();
      
      return false;
    }
    
    // تحديث وقت آخر نشاط
    secureStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString(), true);
    
    logger.debug('الجلسة نشطة');
    return true;
  } catch (error) {
    logger.error('خطأ في التحقق من حالة الجلسة:', error);
    return false;
  }
};

/**
 * مسح بيانات الجلسة
 */
export const clearSessionData = (): void => {
  try {
    // مسح بيانات الجلسة من التخزين المحلي
    secureStorage.removeItem(SESSION_ID_KEY);
    secureStorage.removeItem(LAST_ACTIVITY_KEY);
    
    // مسح بيانات الجلسة من sessionStorage
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    
    // إزالة المستمعين
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    
    logger.debug('تم مسح بيانات الجلسة');
  } catch (error) {
    logger.error('خطأ في مسح بيانات الجلسة:', error);
  }
};

/**
 * تسجيل الخروج وتنظيف الجلسة
 */
export const logoutAndCleanup = async (): Promise<void> => {
  try {
    // تسجيل الخروج من Supabase
    await supabase.auth.signOut();
    
    // مسح بيانات الجلسة
    clearSessionData();
    
    logger.debug('تم تسجيل الخروج وتنظيف الجلسة');
  } catch (error) {
    logger.error('خطأ في تسجيل الخروج وتنظيف الجلسة:', error);
  }
};

export default {
  initializeSession,
  checkSessionOnLoad,
  clearSessionData,
  logoutAndCleanup
};
