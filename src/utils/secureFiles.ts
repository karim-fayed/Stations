/**
 * وحدة لتأمين التعامل مع الملفات في التطبيق
 * توفر وظائف آمنة للتعامل مع الملفات
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * أنواع الملفات المدعومة
 */
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const SUPPORTED_EXCEL_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

/**
 * الحد الأقصى لحجم الملف (5 ميجابايت)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * التحقق من نوع الملف
 * @param file الملف المراد التحقق منه
 * @param allowedTypes أنواع الملفات المسموح بها
 * @returns صحيح إذا كان الملف من النوع المسموح به
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * التحقق من حجم الملف
 * @param file الملف المراد التحقق منه
 * @param maxSize الحد الأقصى لحجم الملف
 * @returns صحيح إذا كان حجم الملف أقل من الحد الأقصى
 */
export const isValidFileSize = (file: File, maxSize: number = MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * التحقق من امتداد الملف
 * @param fileName اسم الملف
 * @param allowedExtensions امتدادات الملفات المسموح بها
 * @returns صحيح إذا كان امتداد الملف مسموحًا به
 */
export const isValidFileExtension = (fileName: string, allowedExtensions: string[]): boolean => {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * تطهير اسم الملف
 * @param fileName اسم الملف
 * @returns اسم الملف بعد التطهير
 */
export const sanitizeFileName = (fileName: string): string => {
  // إزالة الرموز الخطرة من اسم الملف
  return fileName
    .replace(/[<>:"\/\\|?*]/g, '_') // استبدال الرموز غير المسموح بها في أسماء الملفات
    .replace(/\.\./g, '_'); // منع التنقل للمجلد الأعلى
};

/**
 * رفع ملف إلى Supabase Storage بشكل آمن
 * @param file الملف المراد رفعه
 * @param bucket اسم المجلد
 * @param path المسار داخل المجلد
 * @param allowedTypes أنواع الملفات المسموح بها
 * @returns وعد برابط الملف
 */
export const uploadFileSecurely = async (
  file: File,
  bucket: string,
  path: string = '',
  allowedTypes: string[] = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOCUMENT_TYPES]
): Promise<string> => {
  try {
    // التحقق من نوع الملف
    if (!isValidFileType(file, allowedTypes)) {
      console.warn('نوع ملف غير مدعوم:', file.type);
      // في وضع التطوير، نسمح بجميع أنواع الملفات
      if (import.meta.env.PROD) {
        throw new Error('نوع ملف غير مدعوم');
      }
    }

    // التحقق من حجم الملف
    if (!isValidFileSize(file)) {
      console.warn('حجم الملف كبير جدًا:', file.size);
      // في وضع التطوير، نسمح بالملفات الكبيرة
      if (import.meta.env.PROD) {
        throw new Error('حجم الملف كبير جدًا. الحد الأقصى هو 5 ميجابايت');
      }
    }

    // تطهير اسم الملف
    const sanitizedFileName = sanitizeFileName(file.name);

    // إنشاء اسم فريد للملف
    const uniqueFileName = `${Date.now()}_${sanitizedFileName}`;

    // تحديد المسار الكامل
    const fullPath = path ? `${path}/${uniqueFileName}` : uniqueFileName;

    // رفع الملف
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('خطأ في رفع الملف إلى Supabase:', error);
      throw error;
    }

    // الحصول على رابط الملف
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('فشل في رفع الملف:', error);
    throw new Error('فشل في رفع الملف: ' + (error as Error).message);
  }
};

/**
 * حذف ملف من Supabase Storage بشكل آمن
 * @param path مسار الملف
 * @param bucket اسم المجلد
 * @returns وعد بنتيجة الحذف
 */
export const deleteFileSecurely = async (path: string, bucket: string): Promise<void> => {
  try {
    // التحقق من المسار
    if (!path) {
      throw new Error('مسار الملف مطلوب');
    }

    // تطهير المسار
    const sanitizedPath = path.replace(/\.\./g, '_'); // منع التنقل للمجلد الأعلى

    // حذف الملف
    const { error } = await supabase.storage
      .from(bucket)
      .remove([sanitizedPath]);

    if (error) throw error;
  } catch (error) {
    console.error('فشل في حذف الملف:', error);
    throw new Error('فشل في حذف الملف: ' + (error as Error).message);
  }
};

/**
 * تحميل ملف من Supabase Storage بشكل آمن
 * @param path مسار الملف
 * @param bucket اسم المجلد
 * @returns وعد بالملف
 */
export const downloadFileSecurely = async (path: string, bucket: string): Promise<Blob> => {
  try {
    // التحقق من المسار
    if (!path) {
      throw new Error('مسار الملف مطلوب');
    }

    // تطهير المسار
    const sanitizedPath = path.replace(/\.\./g, '_'); // منع التنقل للمجلد الأعلى

    // تحميل الملف
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(sanitizedPath);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('فشل في تحميل الملف:', error);
    throw new Error('فشل في تحميل الملف: ' + (error as Error).message);
  }
};

export default {
  isValidFileType,
  isValidFileSize,
  isValidFileExtension,
  sanitizeFileName,
  uploadFileSecurely,
  deleteFileSecurely,
  downloadFileSecurely,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  SUPPORTED_EXCEL_TYPES,
  MAX_FILE_SIZE
};
