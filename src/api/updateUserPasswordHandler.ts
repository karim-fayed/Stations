
import { supabase } from "@/integrations/supabase/client";

/**
 * Handler for updating user passwords
 * This is used to update passwords for users by the owner
 */
export async function updateUserPasswordHandler(
  userId: string,
  password: string
) {
  try {
    console.log("Starting updateUserPasswordHandler");
    
    // Clean inputs by removing any spaces
    const cleanUserId = userId ? userId.trim() : '';
    const cleanPassword = password ? password.trim().replace(/\s/g, '') : '';

    if (!cleanUserId || !cleanPassword) {
      throw new Error("User ID and password are required");
    }

    // Get current user session to verify permissions
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("You must be logged in to update passwords");
    }
    
    if (!sessionData.session) {
      console.error("No session data found");
      throw new Error("You must be logged in to update passwords");
    }

    const requesterId = sessionData.session.user.id;
    console.log("Requester ID:", requesterId);

    // استدعاء Edge Function لتغيير كلمة المرور
    try {
      console.log("Invoking Edge Function");
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: JSON.stringify({
          userId: cleanUserId,
          password: cleanPassword,
          requesterId: requesterId
        }),
      });

      if (error) {
        console.error("Edge Function error:", error);
        throw error;
      }

      console.log("Edge Function response:", data);

      // طريقة بديلة إذا فشلت Edge Function (للمستخدم الذي يغير كلمة المرور الخاصة به)
      if (requesterId === cleanUserId) {
        try {
          // استخدام updatePassword للمستخدم الحالي
          console.log("Using SDK as fallback for current user");
          const { error: updateError } = await supabase.auth.updateUser({
            password: cleanPassword
          });

          if (updateError) {
            console.error("SDK update error:", updateError);
            throw updateError;
          }

          // تحديث الجلسة لضمان استخدام كلمة المرور الجديدة
          const { error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            console.warn("Error refreshing session:", refreshError);
          }
        } catch (authError) {
          console.warn("Error during auth flow:", authError);
        }
      }

      // تحديث سجل المستخدم
      try {
        const { error: updateUserError } = await supabase
          .from('admin_users')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', cleanUserId);

        if (updateUserError) {
          console.warn("تم تحديث كلمة المرور ولكن تعذر تحديث سجل المستخدم:", updateUserError);
        }
      } catch (dbError) {
        console.warn("Error updating user record:", dbError);
      }

      return { success: true, data: { message: "تم تحديث كلمة المرور بنجاح" } };
    } catch (functionError) {
      console.error("Error invoking function:", functionError);
      throw functionError;
    }
  } catch (error: any) {
    console.error("Error in updateUserPasswordHandler:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    };
  }
}
