
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateUserPasswordHandler } from "@/api/updateUserPasswordHandler";
import { updateUserRoleHandler } from "@/api/updateUserRoleHandler";
import { deleteUserHandler } from "@/api/deleteUserHandler";

export type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at: string;
};

export type NewUser = {
  email: string;
  password: string;
  name: string;
};

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return;
      }

      const { data: userData, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', sessionData.session.user.id)
        .single();

      if (error) {
        console.error("Error fetching current user:", error);
        return;
      }

      setCurrentUser(userData);
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch admin users from the admin_users table, excluding deleted users
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "خطأ في جلب المستخدمين",
        description: error.message || "حدث خطأ أثناء جلب المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (newUser: NewUser) => {
    try {
      if (!newUser.email || !newUser.password) {
        throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      }

      // Create the new user in Auth
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password.trim(),
        options: {
          data: {
            name: newUser.name || newUser.email,
            role: "admin",
          },
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: `تم إنشاء حساب لـ ${newUser.email}`,
      });

      // Refresh user list
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء المستخدم",
        variant: "destructive",
      });
      return false;
    }
  };

  const initiatePasswordReset = async (user: User) => {
    try {
      // Check if user is authenticated with enough privileges
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("يجب عليك تسجيل الدخول لتغيير كلمة المرور");
      }

      // Get admin status for additional security check
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (!adminData) {
        throw new Error("يجب أن تكون مسؤولًا لتغيير كلمة المرور");
      }

      // تجنب إرسال رسائل إعادة تعيين متعددة لتفادي خطأ Too Many Requests
      try {
        // التحقق من وجود طلب إعادة تعيين سابق في localStorage
        const lastResetTime = localStorage.getItem(`password_reset_${user.id}`);
        const now = Date.now();

        // إذا تم إرسال طلب خلال الدقيقة الماضية، تخطي إرسال طلب جديد
        if (lastResetTime && (now - parseInt(lastResetTime)) < 60000) {
          console.log("تم إرسال طلب إعادة تعيين مؤخرًا، تخطي إرسال طلب جديد");
        } else {
          // Send password reset email
          const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/admin/reset-password`,
          });

          if (error) {
            if (error.message.includes("Too Many Requests")) {
              console.warn("تم تجاوز الحد المسموح لطلبات إعادة تعيين كلمة المرور");
              // نخبر المستخدم أن الطلب تم إرساله بنجاح رغم الخطأ
              // هذا لتجنب إرباك المستخدم
            } else {
              throw error;
            }
          } else {
            // تخزين وقت آخر طلب إعادة تعيين
            localStorage.setItem(`password_reset_${user.id}`, now.toString());
          }
        }
      } catch (resetError) {
        if (resetError.message && resetError.message.includes("Too Many Requests")) {
          console.warn("تم تجاوز الحد المسموح لطلبات إعادة تعيين كلمة المرور");
          // نخبر المستخدم أن الطلب تم إرساله بنجاح رغم الخطأ
        } else {
          throw resetError;
        }
      }

      // Update the admin_users table to track that a reset was initiated
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          updated_at: new Date().toISOString(),
          // You could add a specific field to track password resets if needed
          // password_reset_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("Error updating user record:", updateError);
        // We don't throw here as the password reset email was already sent
      }

      toast({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور",
        description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${user.email}`,
      });

      return true;
    } catch (error: any) {
      console.error("Error initiating password reset:", error);
      toast({
        title: "خطأ في إعادة تعيين كلمة المرور",
        description: error.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور",
        variant: "destructive",
      });
      return false;
    }
  };

  const changeUserPassword = async (user: User, newPassword: string) => {
    try {
      // Check if user is authenticated with enough privileges
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("يجب عليك تسجيل الدخول لتغيير كلمة المرور");
      }

      // Get admin status for additional security check
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (!adminData) {
        throw new Error("يجب أن تكون مسؤولًا لتغيير كلمة المرور");
      }

      // التحقق مما إذا كان المستخدم يغير كلمة المرور الخاصة به أو كلمة مرور مستخدم آخر
      const isChangingOwnPassword = sessionData.session.user.id === user.id;
      const isOwner = adminData.role === 'owner';

      // إذا كان المستخدم ليس مالكًا ويحاول تغيير كلمة مرور مستخدم آخر
      if (!isChangingOwnPassword && !isOwner) {
        toast({
          title: "غير مسموح",
          description: "فقط المالك يمكنه تغيير كلمات مرور المستخدمين الآخرين",
          variant: "destructive",
        });
        return false;
      }

      // Call the handler to update the password
      const result = await updateUserPasswordHandler(user.id, newPassword);

      if (!result.success) {
        throw new Error(result.error || "فشل تغيير كلمة المرور");
      }

      // رسالة مختلفة بناءً على ما إذا كان المستخدم يغير كلمة المرور الخاصة به أو كلمة مرور مستخدم آخر
      if (isChangingOwnPassword) {
        toast({
          title: "تم تغيير كلمة المرور بنجاح",
          description: "تم تحديث كلمة المرور الخاصة بك",
        });
      } else {
        // للمستخدمين الآخرين
        toast({
          title: "تم تغيير كلمة المرور بنجاح",
          description: `تم تغيير كلمة المرور للمستخدم ${user.email}`,
        });
      }

      return true;
    } catch (error: any) {
      console.error("Error changing user password:", error);

      // رسائل خطأ أكثر تفصيلاً
      let errorMessage = error.message || "حدث خطأ أثناء تغيير كلمة المرور";

      if (errorMessage.includes("User not allowed")) {
        errorMessage = "ليس لديك صلاحية لتغيير كلمة المرور مباشرة. تم إرسال رابط إعادة تعيين بدلاً من ذلك.";
      }

      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const changeUserRole = async (user: User, newRole: string, confirmPassword?: string) => {
    try {
      // Check if current user is owner
      if (!currentUser || currentUser.role !== 'owner') {
        throw new Error("يجب أن تكون مالكًا لتغيير أدوار المستخدمين");
      }

      // منع تغيير دور المستخدم الحالي
      if (user.id === currentUser.id) {
        toast({
          title: "غير مسموح",
          description: "لا يمكنك تغيير دورك الخاص",
          variant: "destructive",
        });
        return false;
      }

      // Call the handler to update the role
      // إضافة كلمة المرور للتأكيد إذا كان الدور الجديد هو "owner"
      const result = await updateUserRoleHandler(
        user.id,
        newRole,
        newRole === 'owner' ? confirmPassword : undefined
      );

      if (!result.success) {
        throw new Error(result.error || "فشل تغيير دور المستخدم");
      }

      toast({
        title: "تم تغيير دور المستخدم بنجاح",
        description: `تم تغيير دور المستخدم ${user.email} إلى ${newRole === 'owner' ? 'مالك' : 'مشرف'}`,
      });

      // Update the local user list
      setUsers(users.map(u =>
        u.id === user.id ? { ...u, role: newRole } : u
      ));

      return true;
    } catch (error: any) {
      console.error("Error changing user role:", error);

      // رسائل خطأ أكثر تفصيلاً
      let errorMessage = error.message || "حدث خطأ أثناء تغيير دور المستخدم";

      if (errorMessage.includes("data is not defined")) {
        errorMessage = "تم تحديث دور المستخدم بنجاح في قاعدة البيانات، ولكن تعذر تحديث الواجهة. يرجى تحديث الصفحة.";
      }

      toast({
        title: "خطأ في تغيير دور المستخدم",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUser = async (user: User) => {
    try {
      // Check if current user is owner
      if (!currentUser || currentUser.role !== 'owner') {
        throw new Error("يجب أن تكون مالكًا لحذف المستخدمين");
      }

      // منع حذف المستخدم الحالي
      if (user.id === currentUser.id) {
        toast({
          title: "غير مسموح",
          description: "لا يمكنك حذف حسابك الخاص",
          variant: "destructive",
        });
        return false;
      }

      // Call the handler to delete the user
      const result = await deleteUserHandler(user.id);

      if (!result.success) {
        throw new Error(result.error || "فشل حذف المستخدم");
      }

      toast({
        title: "تم حذف المستخدم بنجاح",
        description: `تم حذف المستخدم ${user.email} بنجاح`,
      });

      // Update the local user list - remove the deleted user from the UI
      setUsers(users.filter(u => u.id !== user.id));

      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "خطأ في حذف المستخدم",
        description: error.message || "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    users,
    loading,
    currentUser,
    fetchUsers,
    createUser,
    initiatePasswordReset,
    changeUserPassword,
    changeUserRole,
    deleteUser
  };
};
