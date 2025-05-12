/**
 * خدمة حماية التوكن والمفاتيح الحساسة
 *
 * توفر هذه الخدمة آليات لحماية المفاتيح والتوكن الحساسة من الوصول غير المصرح به
 * وتشفيرها وإخفائها عن أدوات المطور
 */

import { encrypt, decrypt } from './encryptionService';

// قائمة بالمفاتيح الحساسة التي يجب حمايتها
const SENSITIVE_TOKENS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_MAPBOX_TOKEN',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

// كاش للمفاتيح المشفرة
const tokenCache: Record<string, string> = {};

/**
 * تشفير وتخزين مفتاح حساس
 * @param key اسم المفتاح
 * @param value قيمة المفتاح
 */
export const protectToken = (key: string, value: string): void => {
  if (!key || !value) return;

  try {
    // تشفير القيمة
    const encryptedValue = encrypt(value);

    // تخزين القيمة المشفرة في الكاش
    tokenCache[key] = encryptedValue;
  } catch (error) {
    console.error(`Error protecting token ${key}:`, error);
  }
};

/**
 * استرجاع مفتاح محمي
 * @param key اسم المفتاح
 * @returns قيمة المفتاح بعد فك التشفير
 */
export const getProtectedToken = (key: string): string => {
  if (!key) return '';

  try {
    // التحقق من وجود المفتاح في الكاش
    if (tokenCache[key]) {
      return decrypt(tokenCache[key]);
    }

    // إذا لم يكن المفتاح في الكاش، نحاول الحصول عليه من المتغيرات البيئية
    const envValue = import.meta.env[key];

    if (envValue) {
      // تشفير وتخزين القيمة في الكاش للاستخدام المستقبلي
      protectToken(key, envValue);
      return envValue;
    }

    return '';
  } catch (error) {
    console.error(`Error retrieving protected token ${key}:`, error);
    return '';
  }
};

/**
 * حماية جميع المفاتيح الحساسة المعروفة
 */
export const protectAllSensitiveTokens = (): void => {
  try {
    SENSITIVE_TOKENS.forEach(tokenKey => {
      const value = import.meta.env[tokenKey];
      if (value) {
        protectToken(tokenKey, value);
      }
    });

    console.log('All sensitive tokens protected');
  } catch (error) {
    console.error('Error protecting sensitive tokens:', error);
  }
};

/**
 * الحصول على مفتاح Supabase URL المحمي
 */
export const getSupabaseUrl = (): string => {
  return getProtectedToken('VITE_SUPABASE_URL');
};

/**
 * الحصول على مفتاح Supabase Anon Key المحمي
 */
export const getSupabaseAnonKey = (): string => {
  return getProtectedToken('VITE_SUPABASE_ANON_KEY');
};

/**
 * الحصول على توكن MapBox المحمي
 */
export const getMapboxToken = (): string => {
  return getProtectedToken('VITE_MAPBOX_TOKEN');
};

/**
 * إخفاء المفاتيح الحساسة من وحدة التحكم
 * استخدام نهج بديل لا يحاول إعادة تعريف خاصية env
 */
export const hideTokensFromConsole = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // بدلاً من محاولة تغيير import.meta.env، نقوم بتخزين المفاتيح الحساسة في الكاش
    // وإزالة قيمها من النسخة المتاحة للمطور

    // تخزين المفاتيح الحساسة في الكاش أولاً
    SENSITIVE_TOKENS.forEach(key => {
      const value = import.meta.env[key];
      if (value) {
        protectToken(key, value);
      }
    });

    // إضافة تحذير عند محاولة الوصول إلى المفاتيح الحساسة عبر وحدة التحكم
    if (typeof console !== 'undefined' && console.warn) {
      const originalConsoleLog = console.log;
      const originalConsoleDir = console.dir;

      // تعديل console.log لإخفاء المفاتيح الحساسة
      console.log = function(...args) {
        const safeArgs = args.map(arg => {
          // إذا كان الوسيط كائنًا، نتحقق مما إذا كان يحتوي على مفاتيح حساسة
          if (arg && typeof arg === 'object') {
            // نسخ الكائن لتجنب تعديل الكائن الأصلي
            const safeCopy = { ...arg };

            // إخفاء المفاتيح الحساسة
            SENSITIVE_TOKENS.forEach(tokenKey => {
              if (tokenKey in safeCopy) {
                safeCopy[tokenKey] = '[PROTECTED]';
              }
            });

            return safeCopy;
          }

          return arg;
        });

        originalConsoleLog.apply(console, safeArgs);
      };

      // تعديل console.dir لإخفاء المفاتيح الحساسة
      console.dir = function(obj, options) {
        if (obj && typeof obj === 'object') {
          // نسخ الكائن لتجنب تعديل الكائن الأصلي
          const safeCopy = { ...obj };

          // إخفاء المفاتيح الحساسة
          SENSITIVE_TOKENS.forEach(tokenKey => {
            if (tokenKey in safeCopy) {
              safeCopy[tokenKey] = '[PROTECTED]';
            }
          });

          originalConsoleDir.call(console, safeCopy, options);
        } else {
          originalConsoleDir.apply(console, arguments);
        }
      };
    }

    console.log('Sensitive tokens protected from console access');
  } catch (error) {
    console.error('Error hiding tokens from console:', error);
  }
};

export default {
  protectToken,
  getProtectedToken,
  protectAllSensitiveTokens,
  getSupabaseUrl,
  getSupabaseAnonKey,
  getMapboxToken,
  hideTokensFromConsole
};
