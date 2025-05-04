
import { supabase } from "@/integrations/supabase/client";

/**
 * Handler for updating user roles
 * This is used to update roles for users by the owner
 */
export async function updateUserRoleHandler(
  userId: string,
  role: string,
  confirmPassword?: string
) {
  try {
    // Clean inputs by removing any spaces
    const cleanUserId = userId ? userId.trim() : '';
    const cleanRole = role ? role.trim() : '';

    if (!cleanUserId || !cleanRole) {
      throw new Error("User ID and role are required");
    }

    // Get current user session to verify permissions
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      throw new Error("You must be logged in to update user roles");
    }

    const requesterId = sessionData.session.user.id;

    // إذا كان التغيير إلى دور "owner"، نتحقق من كلمة المرور
    if (cleanRole === 'owner') {
      if (!confirmPassword) {
        throw new Error("يجب إدخال كلمة المرور للتأكيد عند تعيين مالك جديد");
      }

      // التحقق من صحة كلمة المرور باستخدام واجهة Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: sessionData.session.user.email!,
        password: confirmPassword
      });

      if (signInError) {
        throw new Error("كلمة المرور غير صحيحة. لا يمكن تعيين مالك جديد");
      }

      // التحقق إذا كان هناك مالك آخر
      const { data: ownersData, error: ownersError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('role', 'owner')
        .neq('id', requesterId);

      if (ownersError) {
        throw new Error("فشل التحقق من المالكين الحاليين");
      }

      // التحقق من عدم وجود أكثر من مالكين
      if (ownersData && ownersData.length >= 2) {
        throw new Error("لا يمكن تعيين أكثر من مالكين اثنين للنظام");
      }
    }

    // تحديث الدور مباشرة في قاعدة البيانات بدلاً من استخدام Edge Function
    try {
      // التحقق من أن المستخدم الحالي هو مالك
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', requesterId)
        .single();

      if (currentUserError) {
        throw new Error("فشل التحقق من صلاحيات المستخدم الحالي");
      }

      if (currentUserData.role !== 'owner') {
        throw new Error("يجب أن تكون مالكًا لتغيير أدوار المستخدمين");
      }

      // تحديث دور المستخدم
      const { data: updateData, error: updateError } = await supabase
        .from('admin_users')
        .update({
          role: cleanRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', cleanUserId)
        .select(); // إضافة select() للحصول على البيانات المحدثة

      if (updateError) {
        throw updateError;
      }

      // لا نحاول تحديث بيانات المستخدم في auth.users مباشرة لأنه يتطلب صلاحيات service_role
      // بدلاً من ذلك، نكتفي بتحديث جدول admin_users فقط
      console.log("تم تحديث دور المستخدم في جدول admin_users بنجاح");

      // في بيئة الإنتاج، يجب استخدام Edge Function مع service_role لتحديث بيانات المستخدم في auth.users

      // محاولة استدعاء Edge Function إذا كانت متاحة
      try {
        const { data, error } = await supabase.functions.invoke('update-user-role', {
          body: JSON.stringify({
            userId: cleanUserId,
            role: cleanRole,
            requesterId: requesterId
          }),
        });

        if (error) {
          console.warn("تعذر استدعاء Edge Function، ولكن تم تحديث الدور بنجاح:", error);
        }
      } catch (edgeFnError) {
        console.warn("تعذر استدعاء Edge Function، ولكن تم تحديث الدور بنجاح:", edgeFnError);
      }
    } catch (directUpdateError) {
      console.error("فشل تحديث الدور مباشرة:", directUpdateError);
      throw directUpdateError;
    }

    return { success: true, data: { role: cleanRole } };
  } catch (error: any) {
    console.error("Error in updateUserRoleHandler:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    };
  }
}
