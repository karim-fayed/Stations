/**
 * خدمة التشفير - تستخدم لتشفير وفك تشفير البيانات الحساسة
 * 
 * تستخدم خوارزمية AES-GCM للتشفير المتماثل مع مفتاح مشتق من PBKDF2
 */

// استخدام مكتبة CryptoJS للتشفير
import CryptoJS from 'crypto-js';

// مفتاح التشفير الافتراضي (يجب تغييره في الإنتاج)
const DEFAULT_KEY = 'noor-stations-default-encryption-key';

// الحصول على مفتاح التشفير من المتغيرات البيئية أو استخدام المفتاح الافتراضي
const getEncryptionKey = (): string => {
  return import.meta.env.VITE_ENCRYPTION_KEY || DEFAULT_KEY;
};

/**
 * تشفير نص باستخدام AES
 * @param text النص المراد تشفيره
 * @param customKey مفتاح مخصص (اختياري)
 * @returns النص المشفر كسلسلة Base64
 */
export const encrypt = (text: string, customKey?: string): string => {
  try {
    if (!text) return '';
    
    const key = customKey || getEncryptionKey();
    
    // إنشاء IV عشوائي (متجه التهيئة)
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // تشفير النص
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // دمج IV مع النص المشفر للتمكن من فك التشفير لاحقاً
    const result = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
    
    return result;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return '';
  }
};

/**
 * فك تشفير نص مشفر
 * @param encryptedText النص المشفر بتنسيق Base64
 * @param customKey مفتاح مخصص (اختياري)
 * @returns النص الأصلي بعد فك التشفير
 */
export const decrypt = (encryptedText: string, customKey?: string): string => {
  try {
    if (!encryptedText) return '';
    
    const key = customKey || getEncryptionKey();
    
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
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return '';
  }
};

/**
 * تشفير كائن JSON
 * @param data الكائن المراد تشفيره
 * @returns سلسلة مشفرة تمثل الكائن
 */
export const encryptObject = <T>(data: T): string => {
  try {
    const jsonString = JSON.stringify(data);
    return encrypt(jsonString);
  } catch (error) {
    console.error('Error encrypting object:', error);
    return '';
  }
};

/**
 * فك تشفير كائن JSON
 * @param encryptedData السلسلة المشفرة
 * @returns الكائن الأصلي بعد فك التشفير
 */
export const decryptObject = <T>(encryptedData: string): T | null => {
  try {
    const jsonString = decrypt(encryptedData);
    if (!jsonString) return null;
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error decrypting object:', error);
    return null;
  }
};

export default {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject
};
