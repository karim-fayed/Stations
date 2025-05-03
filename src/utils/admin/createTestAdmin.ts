
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser } from "./createAdminUser";

/**
 * يقوم بإنشاء مستخدمين مشرفين اختباريين في Supabase إذا لم يكونا موجودين.
 * هذا للأغراض التطويرية فقط.
 */
export async function createTestAdmin() {
  try {
    // بيانات اعتماد مستخدم جديد واضحة وسهلة الاستخدام
    const testEmail = "test@example.com";
    const testPassword = "Test123!";

    console.log("محاولة إنشاء مستخدم اختباري جديد");

    // إنشاء المستخدم المشرف بطريقة Edge Function
    try {
      const response = await fetch('/api/create-admin-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: "Test Admin"
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log("خطأ في استدعاء edge function:", errorData);
        
        // If edge function fails, try client method
        await createAdminUser(testEmail, testPassword, "Test Admin");
      } else {
        const result = await response.json();
        console.log("تم إنشاء المستخدم بنجاح:", result);
      }
    } catch (error) {
      console.error("خطأ في استدعاء edge function:", error);
      
      // إذا فشل استدعاء edge function، جرب طريقة العميل
      await createAdminUser(testEmail, testPassword, "Test Admin");
    }
    
    // تسجيل الخروج بعد إنشاء/التحقق من المستخدمين
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error("خطأ في createTestAdmin:", error);
  }
}
