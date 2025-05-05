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

      // بدلاً من حذف المستخدم من جدول admin_users، نقوم بتحديث حقل is_deleted
      const { error: updateAdminError } = await supabase
        .from('admin_users')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateAdminError) {
        throw updateAdminError;
      }

      // تم تحديث حالة المستخدم في جدول admin_users بنجاح
      console.log("تم تحديث حالة المستخدم في جدول admin_users بنجاح");

      // الآن نحاول حذف المستخدم من auth.users باستخدام Edge Function
      // هذا يتطلب صلاحيات service_role التي تتوفر في Edge Function
      try {
        console.log("جاري استدعاء Edge Function لحذف المستخدم من auth.users...");

        // التحقق مما إذا كنا في بيئة الإنتاج أو التطوير
        const isProduction = window.location.hostname !== 'localhost' &&
                            !window.location.hostname.includes('127.0.0.1');

        if (isProduction) {
          // في بيئة الإنتاج، نستدعي Edge Function
          const { data, error } = await supabase.functions.invoke('delete-user', {
            body: JSON.stringify({
              userId: userId,
              requesterId: requesterId
            }),
          });

          if (error) {
            console.warn("تعذر استدعاء Edge Function، ولكن تم حذف المستخدم من جدول admin_users:", error);
            // لا نرمي خطأ هنا لأن المستخدم تم حذفه بالفعل من جدول admin_users
            // وهذا يكفي لإزالته من واجهة المستخدم
          } else {
            console.log("تم حذف المستخدم بنجاح من auth.users باستخدام Edge Function");
          }
        } else {
          // في بيئة التطوير، نعرض رسالة فقط
          console.log("بيئة التطوير: تم تخطي استدعاء Edge Function. في بيئة الإنتاج، سيتم حذف المستخدم من auth.users أيضًا.");

          // يمكننا أيضًا محاولة حذف المستخدم من auth.users باستخدام API مباشرة
          // لكن هذا قد لا يعمل بسبب قيود الصلاحيات
          try {
            // هذا لن يعمل في معظم الحالات بسبب قيود الصلاحيات، لكنه محاولة إضافية
            const { error: adminDeleteError } = await supabase.auth.admin.deleteUser(userId);
            if (adminDeleteError) {
              console.warn("تعذر حذف المستخدم من auth.users مباشرة:", adminDeleteError);
            } else {
              console.log("تم حذف المستخدم بنجاح من auth.users مباشرة");
            }
          } catch (adminDeleteError) {
            console.warn("تعذر حذف المستخدم من auth.users مباشرة:", adminDeleteError);
          }
        }
      } catch (edgeFnError) {
        console.warn("تعذر استدعاء Edge Function، ولكن تم حذف المستخدم من جدول admin_users:", edgeFnError);
        // لا نرمي خطأ هنا لنفس السبب المذكور أعلاه
      }
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
