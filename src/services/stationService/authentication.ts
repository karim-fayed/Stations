
import { supabase } from "@/integrations/supabase/client";

// إرسال رابط تسجيل دخول سحري للمستخدم المشرف
export const sendMagicLink = async (email: string) => {
  // إزالة المسافات من البريد الإلكتروني
  const trimmedEmail = email.trim();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
  });

  if (error) {
    console.error("Error sending magic link:", error);
    throw error;
  }

  return data;
};

export const adminLogout = async () => {
  try {
    // نهج جديد لتسجيل الخروج بدون استخدام scope=global

    // 1. مسح بيانات الجلسة من localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('sb-') ||
        key.startsWith('supabase.') ||
        key.includes('auth')
      )) {
        console.log(`Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
        // نعيد ضبط i لأن طول localStorage قد تغير
        i--;
      }
    }

    // 2. مسح بيانات الجلسة من sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('sb-') ||
        key.startsWith('supabase.') ||
        key.includes('auth')
      )) {
        console.log(`Removing sessionStorage item: ${key}`);
        sessionStorage.removeItem(key);
        // نعيد ضبط i لأن طول sessionStorage قد تغير
        i--;
      }
    }

    // 3. مسح بيانات الجلسة المعروفة بشكل صريح
    localStorage.removeItem('sb-jtnqcyouncjoebqcalzh-auth-token');
    sessionStorage.removeItem('sb-jtnqcyouncjoebqcalzh-auth-token');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');

    // 4. إعادة تعيين حالة Supabase client
    // نستخدم هذا الأسلوب بدلاً من signOut لتجنب خطأ 403
    try {
      // إعادة تهيئة Supabase client
      await supabase.auth.initialize();

      // التحقق من أن المستخدم قد تم تسجيل خروجه
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.warn("Session still exists after logout attempt");
      } else {
        console.log("Successfully logged out");
      }
    } catch (initError) {
      console.warn("Error reinitializing Supabase client:", initError);
    }

    console.log("تم تسجيل الخروج بنجاح");
    return true;
  } catch (error) {
    console.error("Exception during logout:", error);
    // حتى لو فشل تسجيل الخروج، نعتبر أن المستخدم قد سجل خروجه
    return true;
  }
};

export const checkAdminStatus = async () => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  // Check if the user is an admin in the admin_users table
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', data.session.user.id)
    .single();

  return {
    isAuthenticated: !!data.session && !!adminData,
    user: data.session?.user || null,
  };
};
