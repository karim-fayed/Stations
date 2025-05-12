import { createHash } from 'crypto';

// تشفير البيانات الحساسة
export const encryptData = (data: string): string => {
  const salt = process.env.ENCRYPTION_SALT || 'default-salt';
  return createHash('sha256')
    .update(data + salt)
    .digest('hex');
};

// التحقق من صحة البيانات
export const validateData = (data: any): boolean => {
  if (!data) return false;
  
  // التحقق من نوع البيانات
  if (typeof data !== 'object') return false;
  
  // التحقق من الحقول المطلوبة
  const requiredFields = ['id', 'name', 'region', 'latitude', 'longitude'];
  return requiredFields.every(field => data[field] !== undefined);
};

// تنظيف البيانات من أي محتوى ضار
export const sanitizeData = (data: any): any => {
  if (typeof data !== 'object') return data;
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // إزالة أي محتوى ضار من النصوص
      sanitized[key] = value
        .replace(/<[^>]*>/g, '') // إزالة HTML tags
        .replace(/javascript:/gi, '') // إزالة JavaScript
        .replace(/on\w+=/gi, '') // إزالة event handlers
        .trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// التحقق من صحة الطلب
export const validateRequest = (req: any): boolean => {
  // التحقق من وجود التوكن
  if (!req.headers.authorization) return false;
  
  // التحقق من نوع الطلب
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) return false;
  
  // التحقق من Content-Type
  if (req.method !== 'GET' && req.headers['content-type'] !== 'application/json') return false;
  
  return true;
};

// حماية من هجمات CSRF
export const generateCSRFToken = (): string => {
  return createHash('sha256')
    .update(Math.random().toString())
    .digest('hex');
};

// التحقق من CSRF token
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
}; 