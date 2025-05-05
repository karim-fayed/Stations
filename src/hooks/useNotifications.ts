
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  image_url?: string;
  target_role: string;
  play_sound?: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error('No user found in session');

      // Get user role from admin_users table
      let userRole = null;
      try {
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', userId)
          .single();

        if (userRoleError) {
          console.error("Error fetching user role:", userRoleError);
          // Try alternative approach - get user data directly
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error("Error fetching user data:", userError);
          } else if (userData?.user?.app_metadata?.role) {
            userRole = userData.user.app_metadata.role;
            console.log("Retrieved user role from app_metadata:", userRole);
          } else if (userData?.user?.user_metadata?.role) {
            userRole = userData.user.user_metadata.role;
            console.log("Retrieved user role from user_metadata:", userRole);
          }
        } else if (userRoleData?.role) {
          userRole = userRoleData.role;
          console.log("Retrieved user role from admin_users table:", userRole);
        }
      } catch (roleError) {
        console.error("Error in role retrieval process:", roleError);
      }

      // Determine target roles for this user
      const targetRoles = ['all'];
      if (userRole) {
        // فقط أضف الدور الخاص بالمستخدم (admin أو owner)
        targetRoles.push(userRole);
      }

      console.log(`Fetching notifications for roles: ${targetRoles.join(', ')}`);


      // Fetch notifications targeted for this user's role
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('target_role', targetRoles)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في تحميل الإشعارات',
        description: 'حدث خطأ أثناء محاولة تحميل الإشعارات'
      });
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // الحصول على دور المستخدم الحالي
    const getUserRole = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user?.id) return null;

        // Try to get role from admin_users table
        try {
          const { data: userRoleData, error: roleError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', sessionData.session.user.id)
            .single();

          if (!roleError && userRoleData?.role) {
            console.log("Retrieved user role from admin_users table:", userRoleData.role);
            return userRoleData.role;
          }

          if (roleError) {
            console.error("Error fetching user role for subscription:", roleError);
          }
        } catch (tableError) {
          console.error("Error accessing admin_users table:", tableError);
        }

        // Fallback: try to get role from user metadata
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error("Error fetching user data:", userError);
          } else {
            // Check app_metadata first
            if (userData?.user?.app_metadata?.role) {
              const role = userData.user.app_metadata.role;
              console.log("Retrieved user role from app_metadata:", role);
              return role;
            }

            // Then check user_metadata
            if (userData?.user?.user_metadata?.role) {
              const role = userData.user.user_metadata.role;
              console.log("Retrieved user role from user_metadata:", role);
              return role;
            }
          }
        } catch (metadataError) {
          console.error("Error accessing user metadata:", metadataError);
        }

        // Default to 'admin' if we couldn't determine the role but user is authenticated
        console.log("Could not determine user role, defaulting to 'admin'");
        return 'admin';
      } catch (error) {
        console.error("Error getting user role:", error);
        return null;
      }
    };

    // الاشتراك في تحديثات الإشعارات
    const setupSubscription = async () => {
      const userRole = await getUserRole();
      console.log(`Setting up notification subscription for user role: ${userRole || 'unknown'}`);

      // إنشاء فلتر للإشعارات المستهدفة لهذا المستخدم
      const filter = userRole
        ? `target_role.eq.all,target_role.eq.${userRole}`
        : 'target_role.eq.all';

      console.log(`Notification filter: ${filter}`);

      const channel = supabase
        .channel('notifications_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: filter
          },
          (payload) => {
            console.log('Notification change detected:', payload);
            fetchNotifications();
          }
        )
        .subscribe();

      return channel;
    };

    // إعداد الاشتراك
    let channel: any;
    setupSubscription().then(ch => {
      channel = ch;
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));

    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في تحديث الإشعار',
        description: 'حدث خطأ أثناء محاولة تحديث حالة الإشعار'
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.filter(n => n.id !== id));

      toast({
        title: 'تم حذف الإشعار',
        description: 'تم حذف الإشعار بنجاح'
      });

    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في حذف الإشعار',
        description: 'حدث خطأ أثناء محاولة حذف الإشعار'
      });
    }
  };

  return {
    notifications,
    isLoading,
    markAsRead,
    deleteNotification,
    refetch: fetchNotifications // إضافة وظيفة refetch
  };
};
