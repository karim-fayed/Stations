
import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import NotificationsList from './NotificationsList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { soundService } from '@/services/SoundService';
import { notificationService } from '@/services/NotificationService';

const NotificationsButton = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // تهيئة خدمات الصوت والإشعارات
  useEffect(() => {
    soundService.initialize();
    notificationService.initialize();
  }, []);

  // تشغيل صوت الإشعار وإرسال إشعار سطح المكتب
  const showNotification = (title: string, content: string, playSound: boolean = true) => {
    console.log('Showing notification:', title);

    // إرسال إشعار سطح المكتب إذا كان مسموحًا
    if (notificationService.getPermissionState() === 'granted') {
      notificationService.sendNewNotification(title, content, { playSound });
    } else if (playSound) {
      // تشغيل الصوت فقط إذا لم يكن مسموحًا بإشعارات سطح المكتب
      soundService.playSound('notification');
    }
  };

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get user role
      let userRole = null;

      try {
        const { data: userRoleData, error: roleError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);

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
          } else {
            // Default to 'admin' if authenticated but role not found
            userRole = 'admin';
            console.log("Defaulting to 'admin' role");
          }
        } else if (userRoleData?.role) {
          userRole = userRoleData.role;
          console.log("Retrieved user role from admin_users table:", userRole);
        }
      } catch (roleError) {
        console.error("Error in role retrieval process:", roleError);
        // Default to 'admin' as fallback
        userRole = 'admin';
      }

      // If still no role, return
      if (!userRole) return;

      // Determine target roles for this user
      let targetRoles = ['all'];
      if (userRole) {
        targetRoles.push(userRole);
      }

      // Count unread notifications
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .in('target_role', targetRoles)
        .eq('is_read', false);

      if (error) throw error;

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  };

  // Handle new notifications
  const handleNewNotification = async (payload: any) => {
    // Check if this is a new notification
    if (payload.eventType === 'INSERT') {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Get user role
        let userRole = null;

        try {
          const { data: userRoleData, error: roleError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (roleError) {
            console.error('Error fetching user role for notification:', roleError);

            // Try alternative approach - get user data directly
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
              console.error("Error fetching user data for notification:", userError);
            } else if (userData?.user?.app_metadata?.role) {
              userRole = userData.user.app_metadata.role;
              console.log("Retrieved user role from app_metadata for notification:", userRole);
            } else if (userData?.user?.user_metadata?.role) {
              userRole = userData.user.user_metadata.role;
              console.log("Retrieved user role from user_metadata for notification:", userRole);
            } else {
              // Default to 'admin' if authenticated but role not found
              userRole = 'admin';
              console.log("Defaulting to 'admin' role for notification");
            }
          } else if (userRoleData?.role) {
            userRole = userRoleData.role;
            console.log("Retrieved user role from admin_users table for notification:", userRole);
          }
        } catch (roleError) {
          console.error("Error in role retrieval process for notification:", roleError);
          // Default to 'admin' as fallback
          userRole = 'admin';
        }

        // If still no role, skip notification
        if (!userRole) {
          console.log('User role not found, skipping notification');
          return;
        }
        console.log(`User role: ${userRole}, processing notification...`);

        // Check if this notification is for this user
        const notification = payload.new;
        console.log(`Notification target_role: ${notification.target_role}, user role: ${userRole}`);

        // تحقق دقيق من الدور المستهدف
        const isTargeted =
          notification.target_role === 'all' ||
          (notification.target_role === 'admin' && userRole === 'admin') ||
          (notification.target_role === 'owner' && userRole === 'owner');

        if (isTargeted) {
          console.log(`Notification is targeted for this user with role: ${userRole}`);

          // Show toast notification
          toast({
            title: notification.title,
            description: notification.content,
            className: "toast-welcome"
          });

          // Show notification and play sound if required
          console.log('Notification play_sound value:', notification.play_sound);
          if (notification.play_sound !== false) { // تشغيل الصوت ما لم يكن معطلاً صراحةً
            showNotification(notification.title, notification.content);
          }
        } else {
          console.log(`Notification is NOT targeted for this user with role: ${userRole}`);
        }

        // تحديث عدد الإشعارات غير المقروءة بعد معالجة الإشعار
        fetchUnreadCount();
      } catch (error) {
        console.error('Error processing new notification:', error);
      }
    } else {
      // تحديث عدد الإشعارات غير المقروءة لأي تغيير آخر (تحديث أو حذف)
      fetchUnreadCount();
    }
  };

  // Set up real-time subscription and periodic updates
  useEffect(() => {
    // تحديث عدد الإشعارات غير المقروءة عند تحميل المكون
    fetchUnreadCount();

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
            console.log("NotificationsButton - Retrieved user role from admin_users table:", userRoleData.role);
            return userRoleData.role;
          }

          if (roleError) {
            console.error("Error fetching user role for subscription in NotificationsButton:", roleError);
          }
        } catch (tableError) {
          console.error("Error accessing admin_users table in NotificationsButton:", tableError);
        }

        // Fallback: try to get role from user metadata
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error("Error fetching user data in NotificationsButton:", userError);
          } else {
            // Check app_metadata first
            if (userData?.user?.app_metadata?.role) {
              const role = userData.user.app_metadata.role;
              console.log("NotificationsButton - Retrieved user role from app_metadata:", role);
              return role;
            }

            // Then check user_metadata
            if (userData?.user?.user_metadata?.role) {
              const role = userData.user.user_metadata.role;
              console.log("NotificationsButton - Retrieved user role from user_metadata:", role);
              return role;
            }
          }
        } catch (metadataError) {
          console.error("Error accessing user metadata in NotificationsButton:", metadataError);
        }

        // Default to 'admin' if we couldn't determine the role but user is authenticated
        console.log("NotificationsButton - Could not determine user role, defaulting to 'admin'");
        return 'admin';
      } catch (error) {
        console.error("Error getting user role in NotificationsButton:", error);
        return null;
      }
    };

    // إعداد الاشتراك في تحديثات الإشعارات
    const setupSubscription = async () => {
      const userRole = await getUserRole();
      console.log(`NotificationsButton - Setting up notification subscription for user role: ${userRole || 'unknown'}`);

      // إنشاء فلتر للإشعارات المستهدفة لهذا المستخدم
      const filter = userRole
        ? `target_role.eq.all,target_role.eq.${userRole}`
        : 'target_role.eq.all';

      console.log(`NotificationsButton - Notification filter: ${filter}`);

      const subscription = supabase
        .channel('notifications_button_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: filter
          },
          handleNewNotification
        )
        .subscribe();

      return subscription;
    };

    // إعداد الاشتراك
    let subscription: any;
    setupSubscription().then(sub => {
      subscription = sub;
    });

    // تحديث دوري لعدد الإشعارات غير المقروءة كل 30 ثانية
    const intervalId = setInterval(() => {
      console.log('Periodic update of unread notifications count');
      fetchUnreadCount();
    }, 30000); // 30 seconds

    // تحديث عدد الإشعارات غير المقروءة عند استعادة التركيز على النافذة
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Window became visible, updating unread notifications count');
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // تنظيف عند إزالة المكون
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 max-h-[80vh] overflow-y-auto" align="end">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">الإشعارات</h3>
          <NotificationsList />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsButton;
