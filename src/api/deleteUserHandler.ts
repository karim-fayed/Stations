import { supabase } from "@/integrations/supabase/client";

export const deleteUserHandler = async (userId: string) => {
  try {
    // Check if user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      throw new Error("يجب عليك تسجيل الدخول لحذف المستخدم");
    }

    const requesterId = sessionData.session.user.id;

    // تحديث المستخدم مباشرة في قاعدة البيانات بدلاً من استخدام Edge Function
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
        throw new Error("يجب أن تكون مالكًا لحذف المستخدمين");
      }

      // منع حذف الحساب الخاص بالمستخدم
      if (userId === requesterId) {
        throw new Error("لا يمكنك حذف حسابك الخاص");
      }

      // التحقق من وجود المستخدم
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error("المستخدم غير موجود");
      }

      // حذف المستخدم من جدول admin_users أولاً
      const { error: deleteAdminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (deleteAdminError) {
        throw deleteAdminError;
      }

      // لا نحاول حذف المستخدم من auth.users مباشرة لأنه يتطلب صلاحيات service_role
      // بدلاً من ذلك، نقوم بتعطيل المستخدم في جدول admin_users فقط
      console.log("تم حذف المستخدم من جدول admin_users بنجاح");

      // في بيئة الإنتاج، يجب استخدام Edge Function مع service_role لحذف المستخدم من auth.users
      // أو يمكن إضافة حقل is_deleted إلى جدول admin_users وتحديثه بدلاً من حذف السجل

      // لا نحاول استدعاء Edge Function في بيئة التطوير
      // في بيئة الإنتاج، يمكن تفعيل هذا الكود بعد نشر Edge Function

      /*
      // محاولة استدعاء Edge Function إذا كانت متاحة (اختياري)
      try {
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: JSON.stringify({
            userId: userId,
            requesterId: requesterId
          }),
        });

        if (error) {
          console.warn("تعذر استدعاء Edge Function، ولكن تم حذف المستخدم من جدول admin_users:", error);
        }
      } catch (edgeFnError) {
        console.warn("تعذر استدعاء Edge Function، ولكن تم حذف المستخدم من جدول admin_users:", edgeFnError);
      }
      */
    } catch (directUpdateError) {
      console.error("فشل حذف المستخدم مباشرة:", directUpdateError);
      throw directUpdateError;
    }

    return { success: true, data: { message: "تم حذف المستخدم بنجاح" } };
  } catch (error: any) {
    console.error("Error in deleteUserHandler:", error);
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء حذف المستخدم",
    };
  }
};
