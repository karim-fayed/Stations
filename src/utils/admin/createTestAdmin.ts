
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser } from "./createAdminUser";

/**
 * يقوم بإنشاء مستخدمين مشرفين اختباريين في Supabase إذا لم يكونا موجودين.
 * هذا للأغراض التطويرية فقط.
 */
export async function createTestAdmin() {
  try {
    // بيانات اعتماد مستخدم 1
    const adminEmail = "karim-it@outlook.sa";
    const adminPassword = "|l0v3N@fes";
    
    // بيانات اعتماد مستخدم 2
    const testEmail = "admin@example.com";
    const testPassword = "Admin123!";
    
    // بيانات اعتماد مستخدم 3
    const testEmail3 = "a@a.com";
    const testPassword3 = "Password123!";

    console.log("محاولة إنشاء أو التحقق من المستخدمين المشرفين");

    // إنشاء المستخدم المشرف الأول
    await createAdminUser(adminEmail, adminPassword, "Admin");
    
    // إنشاء مستخدم الاختبار الثاني
    await createAdminUser(testEmail, testPassword, "Test Admin");
    
    // إنشاء مستخدم الاختبار الثالث
    await createAdminUser(testEmail3, testPassword3, "Test Admin 3");
    
    // تسجيل الخروج بعد إنشاء/التحقق من المستخدمين
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error("خطأ في createTestAdmin:", error);
  }
}
