/**
 * وحدة لتأمين استخدام API في التطبيق
 * توفر وظائف آمنة للتعامل مع طلبات API
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * تطهير المدخلات من الرموز الخطرة
 * @param input المدخلات المراد تطهيرها
 * @returns المدخلات بعد التطهير
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // إزالة الرموز الخطرة
  return input.replace(/[<>"'&=+\-@\/*]/g, '');
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
        result[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => 
          typeof item === 'string' ? sanitizeInput(item) : 
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

/**
 * التحقق من صحة المعرف UUID
 * @param id المعرف المراد التحقق منه
 * @returns صحيح إذا كان المعرف صالحًا
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email البريد الإلكتروني المراد التحقق منه
 * @returns صحيح إذا كان البريد الإلكتروني صالحًا
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * إجراء طلب API آمن إلى Supabase
 * @param tableName اسم الجدول
 * @param query نوع الاستعلام
 * @param data البيانات المراد إرسالها
 * @returns وعد بنتيجة الطلب
 */
export const secureSupabaseRequest = async <T>(
  tableName: string, 
  query: 'select' | 'insert' | 'update' | 'delete', 
  data?: Record<string, any>,
  filters?: Record<string, any>
): Promise<T> => {
  try {
    // التحقق من اسم الجدول
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('اسم جدول غير صالح');
    }
    
    // تطهير البيانات
    const sanitizedData = data ? sanitizeObject(data) : undefined;
    const sanitizedFilters = filters ? sanitizeObject(filters) : undefined;
    
    let request = supabase.from(tableName);
    
    switch (query) {
      case 'select':
        request = request.select('*');
        break;
      case 'insert':
        if (!sanitizedData) throw new Error('البيانات مطلوبة للإدراج');
        return await request.insert(sanitizedData) as unknown as T;
      case 'update':
        if (!sanitizedData) throw new Error('البيانات مطلوبة للتحديث');
        request = request.update(sanitizedData);
        break;
      case 'delete':
        request = request.delete();
        break;
      default:
        throw new Error('نوع استعلام غير صالح');
    }
    
    // إضافة الفلاتر
    if (sanitizedFilters) {
      for (const key in sanitizedFilters) {
        if (Object.prototype.hasOwnProperty.call(sanitizedFilters, key)) {
          request = request.eq(key, sanitizedFilters[key]);
        }
      }
    }
    
    const { data: result, error } = await request;
    
    if (error) throw error;
    
    return result as unknown as T;
  } catch (error) {
    console.error('فشل في إجراء طلب Supabase:', error);
    throw new Error('فشل في إجراء طلب Supabase: ' + (error as Error).message);
  }
};

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

export default {
  sanitizeInput,
  sanitizeObject,
  isValidUUID,
  isValidEmail,
  secureSupabaseRequest,
  checkUserPermission
};
