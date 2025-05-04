
import { supabase } from "@/integrations/supabase/client";

/**
 * وظيفة لتغيير كلمة المرور مباشرة
 * هذه الوظيفة تستخدم Edge Function لتحديث كلمة المرور بشكل دائم
 */
export async function directPasswordChange(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // 1. الحصول على جلسة المستخدم الحالية
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error("Session error:", sessionError);
      return {
        success: false,
        error: "جلسة المستخدم غير صالحة. يرجى تسجيل الدخول مرة أخرى."
      };
    }

    const userEmail = sessionData.session.user.email;
    const userId = sessionData.session.user.id;

    if (!userEmail) {
      return {
        success: false,
        error: "بريد المستخدم غير متوفر"
      };
    }

    // 2. التحقق من كلمة المرور الحالية عن طريق محاولة تسجيل الدخول
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      console.error("Current password verification failed:", signInError);
      return {
        success: false,
        error: "كلمة المرور الحالية غير صحيحة"
      };
    }

    // 3. استخدام Edge Function لتحديث كلمة المرور
    try {
      console.log("Invoking Edge Function to update password");
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: JSON.stringify({
          userId: userId,
          password: newPassword,
          requesterId: userId
        }),
      });

      if (error) {
        console.error("Error invoking Edge Function:", error);
        
        // إذا فشلت Edge Function، نستخدم SDK كخطة بديلة
        console.log("Falling back to SDK for password update");
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          console.error("SDK password update failed:", updateError);
          return {
            success: false,
            error: `فشل تغيير كلمة المرور: ${updateError.message}`
          };
        }
      } else {
        console.log("Edge Function response:", data);
      }
    } catch (edgeFnError) {
      console.error("Exception invoking Edge Function:", edgeFnError);

      // إذا فشلت Edge Function، نستخدم SDK كخطة بديلة
      console.log("Falling back to SDK for password update after exception");
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("SDK password update failed after exception:", updateError);
        return {
          success: false,
          error: `فشل تغيير كلمة المرور: ${updateError.message}`
        };
      }
    }

    // 4. تحديث سجل المستخدم في جدول admin_users
    try {
      const { error: updateUserError } = await supabase
        .from('admin_users')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateUserError) {
        console.warn("تم تحديث كلمة المرور ولكن تعذر تحديث سجل المستخدم:", updateUserError);
      }
    } catch (updateDbError) {
      console.error("Error updating user record:", updateDbError);
      // نستمر لأن كلمة المرور قد تم تغييرها بالفعل
    }

    // 5. تسجيل الخروج وإعادة تسجيل الدخول لتطبيق التغييرات
    try {
      // تسجيل الخروج
      await supabase.auth.signOut();

      // إعادة تسجيل الدخول بكلمة المرور الجديدة
      const { error: signInNewError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: newPassword
      });

      if (signInNewError) {
        console.warn("تم تغيير كلمة المرور ولكن تعذر إعادة تسجيل الدخول:", signInNewError);

        // إذا فشل إعادة تسجيل الدخول، نوجه المستخدم إلى صفحة تسجيل الدخول
        window.location.href = '/admin/login';

        return {
          success: true,
          message: "تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى باستخدام كلمة المرور الجديدة."
        };
      }

      return {
        success: true,
        message: "تم تغيير كلمة المرور بنجاح."
      };
    } catch (authError) {
      console.warn("تم تغيير كلمة المرور ولكن حدث خطأ أثناء إعادة تسجيل الدخول:", authError);

      // إذا فشل إعادة تسجيل الدخول، نوجه المستخدم إلى صفحة تسجيل الدخول
      window.location.href = '/admin/login';

      return {
        success: true,
        message: "تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى باستخدام كلمة المرور الجديدة."
      };
    }
  } catch (error: any) {
    console.error("Error in directPasswordChange:", error);
    return {
      success: false,
      error: error.message || "حدث خطأ غير متوقع أثناء تغيير كلمة المرور"
    };
  }
}
