/**
 * وحدة لتأمين الاتصالات في التطبيق
 * توفر وظائف آمنة للتعامل مع الاتصالات
 */

import { supabase } from "@/integrations/supabase/client";
import secureStorage from "./secureStorage";

/**
 * إرسال طلب HTTP آمن
 * @param url عنوان URL
 * @param method طريقة الطلب
 * @param data البيانات المراد إرسالها
 * @param headers رؤوس الطلب
 * @returns وعد بنتيجة الطلب
 */
export const secureFetch = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  headers?: Record<string, string>
): Promise<T> => {
  try {
    // التحقق من URL
    if (!url.startsWith('https://') && !url.startsWith('http://localhost')) {
      throw new Error('يجب أن يبدأ URL بـ https:// أو http://localhost');
    }
    
    // إعداد الخيارات
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'same-origin'
    };
    
    // إضافة البيانات إذا كانت موجودة
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    // إرسال الطلب
    const response = await fetch(url, options);
    
    // التحقق من الاستجابة
    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status} ${response.statusText}`);
    }
    
    // تحليل الاستجابة
    const result = await response.json();
    
    return result as T;
  } catch (error) {
    console.error('فشل في إرسال الطلب:', error);
    throw new Error('فشل في إرسال الطلب: ' + (error as Error).message);
  }
};

/**
 * الحصول على رمز الجلسة الحالي
 * @returns وعد برمز الجلسة
 */
export const getSessionToken = async (): Promise<string | null> => {
  try {
    // محاولة الحصول على الرمز من التخزين المحلي أولاً
    const cachedToken = secureStorage.getItem<string>('session_token', '');
    
    if (cachedToken) {
      return cachedToken;
    }
    
    // الحصول على الجلسة من Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }
    
    // تخزين الرمز في التخزين المحلي
    secureStorage.setItem('session_token', session.access_token, true);
    
    return session.access_token;
  } catch (error) {
    console.error('فشل في الحصول على رمز الجلسة:', error);
    return null;
  }
};

/**
 * إرسال طلب HTTP آمن مع رمز الجلسة
 * @param url عنوان URL
 * @param method طريقة الطلب
 * @param data البيانات المراد إرسالها
 * @returns وعد بنتيجة الطلب
 */
export const secureAuthFetch = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  try {
    // الحصول على رمز الجلسة
    const token = await getSessionToken();
    
    if (!token) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // إرسال الطلب مع رمز الجلسة
    return await secureFetch<T>(url, method, data, {
      'Authorization': `Bearer ${token}`
    });
  } catch (error) {
    console.error('فشل في إرسال الطلب المصرح به:', error);
    throw new Error('فشل في إرسال الطلب المصرح به: ' + (error as Error).message);
  }
};

/**
 * إرسال بيانات النموذج بشكل آمن
 * @param url عنوان URL
 * @param formData بيانات النموذج
 * @returns وعد بنتيجة الطلب
 */
export const secureFormSubmit = async <T>(
  url: string,
  formData: FormData
): Promise<T> => {
  try {
    // التحقق من URL
    if (!url.startsWith('https://') && !url.startsWith('http://localhost')) {
      throw new Error('يجب أن يبدأ URL بـ https:// أو http://localhost');
    }
    
    // الحصول على رمز الجلسة
    const token = await getSessionToken();
    
    // إعداد الخيارات
    const options: RequestInit = {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
      body: formData,
      credentials: 'same-origin'
    };
    
    // إرسال الطلب
    const response = await fetch(url, options);
    
    // التحقق من الاستجابة
    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status} ${response.statusText}`);
    }
    
    // تحليل الاستجابة
    const result = await response.json();
    
    return result as T;
  } catch (error) {
    console.error('فشل في إرسال النموذج:', error);
    throw new Error('فشل في إرسال النموذج: ' + (error as Error).message);
  }
};

/**
 * إنشاء اشتراك Supabase آمن
 * @param table اسم الجدول
 * @param event نوع الحدث
 * @param callback دالة الاستدعاء
 * @returns وظيفة لإلغاء الاشتراك
 */
export const secureSubscription = (
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void
): (() => void) => {
  try {
    // التحقق من اسم الجدول
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error('اسم جدول غير صالح');
    }
    
    // إنشاء الاشتراك
    const subscription = supabase
      .channel(`table-changes-${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        (payload) => {
          // تنفيذ دالة الاستدعاء
          callback(payload);
        }
      )
      .subscribe();
    
    // إرجاع وظيفة لإلغاء الاشتراك
    return () => {
      supabase.removeChannel(subscription);
    };
  } catch (error) {
    console.error('فشل في إنشاء الاشتراك:', error);
    // إرجاع وظيفة فارغة في حالة الخطأ
    return () => {};
  }
};

export default {
  secureFetch,
  secureAuthFetch,
  secureFormSubmit,
  getSessionToken,
  secureSubscription
};
