
import { supabase } from "@/integrations/supabase/client";

// إنشاء مستخدم مشرف جديد
export const createAdminUser = async (email: string, password: string) => {
  try {
    // استخدام واجهة برمجة التطبيقات العامة لإنشاء مستخدم
    // في بيئة الإنتاج يجب استخدام وظيفة خلفية آمنة لهذه العملية
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/admin/dashboard',
      }
    });

    if (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }

    console.log("Admin user created successfully:", data);
    
    // إنشاء رابط تأكيد بريد إلكتروني للمستخدم
    const { error: otpError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin + '/admin/dashboard',
      }
    });

    if (otpError) {
      console.error("Error sending confirmation email:", otpError);
    }

    // إعطاء المستخدم دور المسؤول (يتطلب وظيفة RLS أو Edge Function في الإنتاج)
    // في هذا المشروع يمكن للمستخدمين المسجلين بأي بريد إلكتروني تسجيل الدخول كمسؤول
    
    return data;
  } catch (error) {
    console.error("Error in createAdminUser function:", error);
    throw error;
  }
}

// استدعاء هذه الوظيفة لإنشاء حساب المسؤول الجديد
export const setupNewAdmin = async () => {
  try {
    await createAdminUser("karim-it@outlook.sa", "|l0v3N@fes");
    console.log("Admin user setup complete");
    return true;
  } catch (error) {
    console.error("Failed to setup admin:", error);
    return false;
  }
}

// Execute setupNewAdmin to create the admin user
setupNewAdmin();
