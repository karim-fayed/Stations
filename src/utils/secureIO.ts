/**
 * وحدة لتأمين المدخلات والمخرجات في التطبيق
 * توفر وظائف آمنة للتعامل مع المدخلات والمخرجات
 */

/**
 * تطهير النص من الرموز الخطرة
 * @param input النص المراد تطهيره
 * @returns النص بعد التطهير
 */
export const sanitizeHTML = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // إزالة الوسوم HTML والنصوص البرمجية
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\$/g, '&#36;');
};

/**
 * تطهير النص من الرموز الخطرة مع الحفاظ على بعض وسوم HTML الآمنة
 * @param input النص المراد تطهيره
 * @returns النص بعد التطهير
 */
export const sanitizeHTMLAllowSome = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // قائمة الوسوم المسموح بها
  const allowedTags = ['b', 'i', 'u', 'p', 'br', 'span', 'a', 'ul', 'ol', 'li'];
  
  // إزالة جميع الوسوم ما عدا المسموح بها
  let output = input;
  
  // إزالة النصوص البرمجية
  output = output.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // إزالة الأحداث
  output = output.replace(/on\w+="[^"]*"/g, '');
  output = output.replace(/on\w+='[^']*'/g, '');
  
  // إزالة الوسوم غير المسموح بها
  const tagsRegex = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\\b)[^>]+>`, 'gi');
  output = output.replace(tagsRegex, '');
  
  // تطهير الروابط
  output = output.replace(/href=['"]javascript:[^'"]*['"]/gi, 'href="#"');
  
  return output;
};

/**
 * تطهير مدخلات النموذج
 * @param input المدخلات المراد تطهيرها
 * @returns المدخلات بعد التطهير
 */
export const sanitizeFormInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // إزالة الرموز الخطرة
  return input.replace(/[<>"'`]/g, '');
};

/**
 * تطهير مدخلات SQL
 * @param input المدخلات المراد تطهيرها
 * @returns المدخلات بعد التطهير
 */
export const sanitizeSQLInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // إزالة الرموز الخطرة في SQL
  return input.replace(/['";\\]/g, '');
};

/**
 * تطهير مدخلات URL
 * @param input المدخلات المراد تطهيرها
 * @returns المدخلات بعد التطهير
 */
export const sanitizeURLInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // إزالة الرموز الخطرة في URL
  return encodeURIComponent(input);
};

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email البريد الإلكتروني المراد التحقق منه
 * @returns صحيح إذا كان البريد الإلكتروني صالحًا
 */
export const isValidEmail = (email: string): boolean => {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * التحقق من صحة رقم الهاتف
 * @param phone رقم الهاتف المراد التحقق منه
 * @returns صحيح إذا كان رقم الهاتف صالحًا
 */
export const isValidPhone = (phone: string): boolean => {
  if (typeof phone !== 'string') return false;
  
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone);
};

/**
 * التحقق من صحة كلمة المرور
 * @param password كلمة المرور المراد التحقق منها
 * @returns صحيح إذا كانت كلمة المرور صالحة
 */
export const isValidPassword = (password: string): boolean => {
  if (typeof password !== 'string') return false;
  
  // كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وحرف صغير ورقم
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * تطهير كائن من الرموز الخطرة
 * @param obj الكائن المراد تطهيره
 * @returns الكائن بعد التطهير
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        result[key] = sanitizeFormInput(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => 
          typeof item === 'string' ? sanitizeFormInput(item) : 
          typeof item === 'object' && item !== null ? sanitizeObject(item) : 
          item
        );
      } else {
        result[key] = value;
      }
    }
  }
  
  return result as T;
};

export default {
  sanitizeHTML,
  sanitizeHTMLAllowSome,
  sanitizeFormInput,
  sanitizeSQLInput,
  sanitizeURLInput,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  sanitizeObject
};
