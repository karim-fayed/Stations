/**
 * وحدة للتخزين الآمن للبيانات المحلية
 * تستخدم التشفير لحماية البيانات المخزنة في localStorage
 */

// مفتاح التشفير (يجب أن يكون فريدًا لكل تطبيق)
const ENCRYPTION_KEY = 'station-noor-secure-storage-key';

// بادئة للمفاتيح المشفرة
const ENCRYPTED_PREFIX = 'encrypted:';

// قائمة المفاتيح الحساسة التي يجب تشفيرها دائمًا
const SENSITIVE_KEYS = [
  'token',
  'auth',
  'session',
  'password',
  'key',
  'secret',
  'credentials',
  'user'
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
 * تشفير نص باستخدام مفتاح
 * @param text النص المراد تشفيره
 * @returns النص المشفر
 */
const encrypt = (text: string): string => {
  try {
    // تنفيذ تشفير بسيط (في الإنتاج، استخدم مكتبة تشفير قوية)
    const result = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result.push(String.fromCharCode(charCode));
    }
    return btoa(encodeURIComponent(result.join('')));
  } catch (error) {
    console.error('Error encrypting data:', error);
    // في حالة الخطأ، نعيد النص الأصلي
    return text;
  }
};

/**
 * فك تشفير نص باستخدام مفتاح
 * @param encryptedText النص المشفر
 * @returns النص الأصلي
 */
const decrypt = (encryptedText: string): string => {
  try {
    const text = decodeURIComponent(atob(encryptedText));
    const result = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result.push(String.fromCharCode(charCode));
    }
    return result.join('');
  } catch (error) {
    console.error('Error decrypting data:', error);
    // في حالة الخطأ، نعيد النص المشفر
    return encryptedText;
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
 * واجهة التخزين الآمن
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
        // تشفير القيمة
        const encryptedValue = encrypt(jsonValue);

        // تخزين القيمة المشفرة
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

      // إذا كانت القيمة مشفرة، فك تشفيرها
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
          // في حالة فشل فك التشفير، نحاول قراءة القيمة كما هي
          try {
            return JSON.parse(storedValue.substring(ENCRYPTED_PREFIX.length)) as T;
          } catch {
            return defaultValue;
          }
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
  }
};

export default secureStorage;
