
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch admin users from the admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
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

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        throw error;
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

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    initiatePasswordReset
  };
};
