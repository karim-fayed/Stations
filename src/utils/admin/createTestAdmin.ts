
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser } from "./createAdminUser";

/**
 * يقوم بإنشاء مستخدمين مشرفين اختباريين في Supabase إذا لم يكونا موجودين.
 * هذا للأغراض التطويرية فقط.
 */
export async function createTestAdmin() {
  try {
    // قائمة بالمستخدمين المشرفين للاختبار
    const testUsers = [
      { email: "admin@test-station.com", password: "Test123!", name: "Test Admin" },
      { email: "a@a.com", password: "Password123!", name: "Admin A" },
      { email: "admin@example.com", password: "Admin123!", name: "Example Admin" },
      { email: "test@admin.com", password: "Test123!", name: "Test User" }
    ];

    console.log("محاولة إنشاء مستخدمين اختباريين جدد");

    // إنشاء المستخدمين المشرفين
    for (const user of testUsers) {
      console.log(`محاولة إنشاء المستخدم: ${user.email}`);

      try {
        // First try direct Supabase Edge Function invocation
        const { data: edgeFnData, error: edgeFnError } = await supabase.functions.invoke('create-admin-account', {
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            name: user.name
          }),
        });

        if (edgeFnError) {
          console.error(`خطأ في استدعاء edge function مباشرة لـ ${user.email}:`, edgeFnError);
          throw edgeFnError;
        }

        if (edgeFnData) {
          console.log(`تم إنشاء المستخدم ${user.email} بنجاح (مباشرة):`, edgeFnData);
          continue; // انتقل للمستخدم التالي
        }
      } catch (directError) {
        console.error(`فشل استدعاء edge function مباشرة لـ ${user.email}:`, directError);

        // Fallback to API route if direct invocation fails
        try {
          console.log(`محاولة استخدام API route لـ ${user.email}...`);
          const response = await fetch('/api/create-admin-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              password: user.password,
              name: user.name
            }),
          });

          if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
              const errorData = await response.json();
              console.error(`خطأ في استدعاء edge function عبر API لـ ${user.email}:`, errorData);
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              console.error(`تعذر قراءة رد الخطأ كـ JSON لـ ${user.email}:`, jsonError);
            }
            throw new Error(errorMessage);
          } else {
            try {
              const result = await response.json();
              console.log(`تم إنشاء المستخدم ${user.email} بنجاح:`, result);
              continue; // انتقل للمستخدم التالي
            } catch (jsonError) {
              console.warn(`تم إنشاء المستخدم ${user.email} ولكن تعذر قراءة الرد كـ JSON:`, jsonError);
              continue; // انتقل للمستخدم التالي
            }
          }
        } catch (apiError) {
          console.error(`فشل استدعاء API route لـ ${user.email}:`, apiError);

          // إذا فشلت كل الطرق السابقة، جرب طريقة العميل
          console.log(`محاولة إنشاء المستخدم ${user.email} عبر createAdminUser...`);
          await createAdminUser(user.email, user.password, user.name);
        }
      }
    }

    // تسجيل الخروج بعد إنشاء/التحقق من المستخدمين
    await supabase.auth.signOut();

  } catch (error) {
    console.error("خطأ في createTestAdmin:", error);
  }
}
