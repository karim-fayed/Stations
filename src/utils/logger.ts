/**
 * وحدة التسجيل الآمنة - تمنع تسرب البيانات الحساسة في وحدة تحكم المتصفح
 *
 * ملاحظة: تم تبسيط هذه الوحدة مؤقتًا لإصلاح مشكلة فتح التطبيق
 */

// تحديد ما إذا كان التسجيل مفعلاً أم لا
// استخدام import.meta.env بدلاً من process.env
const isLoggingEnabled = import.meta.env.DEV === true;

// قائمة بالكلمات المفتاحية التي يجب تصفيتها من السجلات (مبسطة)
const sensitiveKeywords = [
  'token',
  'key',
  'password',
  'secret',
  'auth',
  'api',
  'access_token',
  'refresh_token',
  'id_token',
  'jwt',
  'session',
  'credentials',
  'supabase',
  'eyJ', // بداية JWT tokens
];

/**
 * وظائف التسجيل الآمنة (مبسطة)
 */
export const logger = {
  /**
   * تسجيل معلومات
   */
  info: (message: string, ...data: any[]): void => {
    if (!isLoggingEnabled) return;
    console.info(message, ...data);
  },

  /**
   * تسجيل أخطاء
   */
  error: (message: string, ...data: any[]): void => {
    console.error(message, ...data);
  },

  /**
   * تسجيل تحذيرات
   */
  warn: (message: string, ...data: any[]): void => {
    if (!isLoggingEnabled) return;
    console.warn(message, ...data);
  },

  /**
   * تسجيل معلومات تصحيح الأخطاء - فقط في وضع التطوير
   */
  debug: (message: string, ...data: any[]): void => {
    if (!isLoggingEnabled) return;
    console.debug(message, ...data);
  },

  /**
   * تسجيل بدون تصفية - استخدم هذا فقط للبيانات غير الحساسة
   */
  log: (message: string, ...data: any[]): void => {
    if (!isLoggingEnabled) return;
    console.log(message, ...data);
  }
};

// تصدير افتراضي
export default logger;
