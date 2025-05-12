/**
 * وحدة للتخزين الآمن للبيانات المحلية
 * تستخدم التشفير لحماية البيانات المخزنة في localStorage
 * تم تحديثها لاستخدام خوارزمية تشفير أقوى (AES)
 */

import CryptoJS from 'crypto-js';

// الحصول على مفتاح التشفير من المتغيرات البيئية أو استخدام مفتاح افتراضي
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'station-noor-secure-storage-key-v2';

// بادئة للمفاتيح المشفرة
const ENCRYPTED_PREFIX = 'encrypted_v2:';

// قائمة المفاتيح الحساسة التي يجب تشفيرها دائمًا
const SENSITIVE_KEYS = [
  'token',
  'auth',
  'session',
  'password',
  'key',
  'secret',
  'credentials',
  'user',
  'api',
  'mapbox',
  'supabase',
  'firebase',
  'admin',
  'access',
  'refresh'
];

/**
 * التحقق مما إذا كان المفتاح حساسًا
 * @param key المفتاح المراد التحقق منه
 * @returns صحيح إذا كان المفتاح حساسًا
 */
const isSensitiveKey = (key: string): boolean => {
  return SENSITIVE_KEYS.some(sensitiveKey =>
    key.toLowerCase().includes(sensitiveKey.toLowerCase())
  );
};

/**
 * تشفير نص باستخدام خوارزمية AES
 * @param text النص المراد تشفيره
 * @returns النص المشفر
 */
const encrypt = (text: string): string => {
  try {
    if (!text) return '';

    // إنشاء IV عشوائي (متجه التهيئة)
    const iv = CryptoJS.lib.WordArray.random(16);

    // تشفير النص باستخدام AES
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // دمج IV مع النص المشفر للتمكن من فك التشفير لاحقًا
    const result = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);

    return result;
  } catch (error) {
    console.error('Error encrypting data:', error);
    // في حالة الخطأ، نعيد النص الأصلي مع تحذير
    console.warn('Returning unencrypted data due to encryption error');
    return text;
  }
};

/**
 * فك تشفير نص مشفر باستخدام خوارزمية AES
 * @param encryptedText النص المشفر
 * @returns النص الأصلي بعد فك التشفير
 */
const decrypt = (encryptedText: string): string => {
  try {
    if (!encryptedText) return '';

    // تحويل النص المشفر من Base64 إلى WordArray
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedText);

    // استخراج IV (أول 16 بايت)
    const iv = CryptoJS.lib.WordArray.create(
      ciphertext.words.slice(0, 4),
      16
    );

    // استخراج النص المشفر (باقي البيانات)
    const encryptedData = CryptoJS.lib.WordArray.create(
      ciphertext.words.slice(4),
      ciphertext.sigBytes - 16
    );

    // إنشاء كائن CipherParams
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedData
    });

    // فك التشفير
    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      ENCRYPTION_KEY,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting data:', error);

    // محاولة فك التشفير بالطريقة القديمة إذا فشلت الطريقة الجديدة
    try {
      // هذا للتوافق مع البيانات المشفرة بالطريقة القديمة
      const text = decodeURIComponent(atob(encryptedText));
      const result = [];
      const oldKey = 'station-noor-secure-storage-key';

      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ oldKey.charCodeAt(i % oldKey.length);
        result.push(String.fromCharCode(charCode));
      }

      return result.join('');
    } catch (legacyError) {
      console.error('Error decrypting with legacy method:', legacyError);
      return encryptedText;
    }
  }
};

/**
 * تطهير البيانات من الرموز الخطرة
 * @param data البيانات المراد تطهيرها
 * @returns البيانات بعد التطهير
 */
const sanitizeData = (data: any): any => {
  if (typeof data === 'string') {
    // إزالة الرموز الخطرة
    return data.replace(/[<>"'&]/g, '');
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }

  return data;
};

/**
 * واجهة التخزين الآمن - الإصدار المحسن
 * يستخدم تشفير AES مع تطهير البيانات وحماية إضافية
 */
export const secureStorage = {
  /**
   * تخزين قيمة بشكل آمن
   * @param key المفتاح
   * @param value القيمة
   * @param forceEncryption إجبار التشفير
   */
  setItem: (key: string, value: any, forceEncryption: boolean = false): void => {
    try {
      // تطهير البيانات
      const sanitizedValue = sanitizeData(value);

      // تحويل القيمة إلى سلسلة JSON
      const jsonValue = JSON.stringify(sanitizedValue);

      // التحقق مما إذا كان يجب تشفير البيانات
      if (forceEncryption || isSensitiveKey(key)) {
        // تشفير القيمة باستخدام الخوارزمية المحسنة
        const encryptedValue = encrypt(jsonValue);

        // تخزين القيمة المشفرة مع البادئة الجديدة
        localStorage.setItem(key, ENCRYPTED_PREFIX + encryptedValue);
      } else {
        // تخزين القيمة بدون تشفير
        localStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
    }
  },

  /**
   * استرجاع قيمة مخزنة بشكل آمن
   * @param key المفتاح
   * @param defaultValue القيمة الافتراضية
   * @returns القيمة المخزنة أو القيمة الافتراضية
   */
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      // استرجاع القيمة المخزنة
      const storedValue = localStorage.getItem(key);

      // إذا لم تكن هناك قيمة مخزنة، إرجاع القيمة الافتراضية
      if (!storedValue) {
        return defaultValue;
      }

      // التعامل مع القيم المشفرة بالإصدار الجديد
      if (storedValue.startsWith(ENCRYPTED_PREFIX)) {
        try {
          const encryptedValue = storedValue.substring(ENCRYPTED_PREFIX.length);
          const decryptedValue = decrypt(encryptedValue);

          // تحويل القيمة من سلسلة JSON
          try {
            return JSON.parse(decryptedValue) as T;
          } catch {
            return decryptedValue as unknown as T;
          }
        } catch (decryptError) {
          console.warn(`Error decrypting item ${key}:`, decryptError);
          return defaultValue;
        }
      }

      // التعامل مع القيم المشفرة بالإصدار القديم
      if (storedValue.startsWith('encrypted:')) {
        try {
          const encryptedValue = storedValue.substring('encrypted:'.length);
          // استخدام دالة فك التشفير التي تدعم الإصدار القديم
          const decryptedValue = decrypt(encryptedValue);

          // تحويل القيمة من سلسلة JSON
          try {
            return JSON.parse(decryptedValue) as T;
          } catch {
            return decryptedValue as unknown as T;
          }
        } catch (decryptError) {
          console.warn(`Error decrypting legacy item ${key}:`, decryptError);
          return defaultValue;
        }
      }

      // إذا كانت القيمة غير مشفرة، تحويلها من سلسلة JSON
      try {
        return JSON.parse(storedValue) as T;
      } catch {
        return storedValue as unknown as T;
      }
    } catch (error) {
      console.error(`Error retrieving item ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * حذف قيمة مخزنة
   * @param key المفتاح
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  /**
   * مسح جميع القيم المخزنة
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  /**
   * التحقق مما إذا كان المفتاح موجودًا
   * @param key المفتاح
   * @returns صحيح إذا كان المفتاح موجودًا
   */
  hasItem: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking item ${key}:`, error);
      return false;
    }
  },

  /**
   * إعادة تشفير جميع البيانات المخزنة باستخدام الخوارزمية الجديدة
   * مفيد عند الترقية من الإصدار القديم إلى الإصدار الجديد
   */
  upgradeEncryption: (): void => {
    try {
      const keys = Object.keys(localStorage);
      let upgradedCount = 0;

      for (const key of keys) {
        const value = localStorage.getItem(key);

        // تحديث القيم المشفرة بالإصدار القديم فقط
        if (value && value.startsWith('encrypted:')) {
          try {
            const encryptedValue = value.substring('encrypted:'.length);
            const decryptedValue = decrypt(encryptedValue);

            // إعادة تشفير القيمة باستخدام الخوارزمية الجديدة
            const newEncryptedValue = encrypt(decryptedValue);
            localStorage.setItem(key, ENCRYPTED_PREFIX + newEncryptedValue);

            upgradedCount++;
          } catch (error) {
            console.error(`Error upgrading encryption for key ${key}:`, error);
          }
        }
      }

      console.log(`Upgraded encryption for ${upgradedCount} items`);
    } catch (error) {
      console.error('Error upgrading encryption:', error);
    }
  }
};

export default secureStorage;
