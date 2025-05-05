
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import NotificationsLoading from './NotificationsLoading';
import EmptyNotifications from './EmptyNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { soundService } from '@/services/SoundService';
import { notificationService } from '@/services/NotificationService';

interface NotificationsPopupProps {
  className?: string;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ className }) => {
  const { notifications, isLoading, markAsRead, deleteNotification, refetch } = useNotifications();
  const { toast } = useToast();

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // تهيئة خدمات الصوت والإشعارات
  useEffect(() => {
    soundService.initialize();
    notificationService.initialize();
  }, []);

  // تشغيل صوت الإشعار وإرسال إشعار سطح المكتب
  const showNotification = (title: string, content: string, playSound: boolean = true) => {
    console.log('Showing notification in NotificationsPopup:', title);

    // إرسال إشعار سطح المكتب إذا كان مسموحًا
    if (notificationService.getPermissionState() === 'granted') {
      notificationService.sendNewNotification(title, content, { playSound });
    } else if (playSound) {
      // تشغيل الصوت فقط إذا لم يكن مسموحًا بإشعارات سطح المكتب
      soundService.playSound('notification');
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
        const { data: userRoleData, error: roleError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role for notification in NotificationsPopup:', roleError);
          return; // لا تستمر إذا كان هناك خطأ في جلب دور المستخدم
        }

        if (!userRoleData || !userRoleData.role) {
          console.log('User role not found in NotificationsPopup, skipping notification');
          return;
        }

        const userRole = userRoleData.role;
        console.log(`NotificationsPopup - User role: ${userRole}, processing notification...`);

        // Check if this notification is for this user
        const notification = payload.new;
        console.log(`NotificationsPopup - Notification target_role: ${notification.target_role}, user role: ${userRole}`);

        // تحقق دقيق من الدور المستهدف
        const isTargeted =
          notification.target_role === 'all' ||
          (notification.target_role === 'admin' && userRole === 'admin') ||
          (notification.target_role === 'owner' && userRole === 'owner');

        if (isTargeted) {
          console.log(`NotificationsPopup - Notification is targeted for this user with role: ${userRole}`);

          // Show toast notification
          toast({
            title: notification.title,
            description: notification.content,
            className: "toast-welcome"
          });

          // Show notification and play sound if required
          console.log('Notification play_sound value in NotificationsPopup:', notification.play_sound);
          if (notification.play_sound !== false) { // تشغيل الصوت ما لم يكن معطلاً صراحةً
            showNotification(notification.title, notification.content);
          }
        } else {
          console.log(`NotificationsPopup - Notification is NOT targeted for this user with role: ${userRole}`);
        }
      } catch (error) {
        console.error('Error processing new notification in NotificationsPopup:', error);
      }
    }
  };

  // Set up real-time subscription and periodic updates
  useEffect(() => {
    // تحديث عدد الإشعارات غير المقروءة عند تحميل المكون
    try {
      if (typeof refetch === 'function') {
        refetch();
      } else {
        console.warn('refetch is not a function in NotificationsPopup');
      }
    } catch (error) {
      console.error('Error calling refetch in NotificationsPopup:', error);
    }

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
            console.log("NotificationsPopup - Retrieved user role from admin_users table:", userRoleData.role);
            return userRoleData.role;
          }

          if (roleError) {
            console.error("Error fetching user role for subscription in NotificationsPopup:", roleError);
          }
        } catch (tableError) {
          console.error("Error accessing admin_users table in NotificationsPopup:", tableError);
        }

        // Default to 'admin' if we couldn't determine the role but user is authenticated
        console.log("NotificationsPopup - Could not determine user role, defaulting to 'admin'");
        return 'admin';
      } catch (error) {
        console.error("Error getting user role in NotificationsPopup:", error);
        return null;
      }
    };

    // إعداد الاشتراك في تحديثات الإشعارات
    const setupSubscription = async () => {
      const userRole = await getUserRole();
      console.log(`NotificationsPopup - Setting up notification subscription for user role: ${userRole || 'unknown'}`);

      // إنشاء فلتر للإشعارات المستهدفة لهذا المستخدم
      const filter = userRole
        ? `target_role.eq.all,target_role.eq.${userRole}`
        : 'target_role.eq.all';

      console.log(`NotificationsPopup - Notification filter: ${filter}`);

      const subscription = supabase
        .channel('notifications_popup_changes')
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

    // تحديث دوري للإشعارات كل 30 ثانية
    const intervalId = setInterval(() => {
      console.log('Periodic update of notifications in NotificationsPopup');
      try {
        if (typeof refetch === 'function') {
          refetch();
        }
      } catch (error) {
        console.error('Error in periodic refetch:', error);
      }
    }, 30000); // 30 seconds

    // تحديث الإشعارات عند استعادة التركيز على النافذة
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Window became visible, updating notifications in NotificationsPopup');
        try {
          if (typeof refetch === 'function') {
            refetch();
          }
        } catch (error) {
          console.error('Error in visibility change refetch:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // تنظيف عند إزالة المكون
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative ${className || ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto p-0"
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">الإشعارات</h3>
        </div>

        <div className="overflow-y-auto max-h-72">
          {isLoading ? (
            <NotificationsLoading />
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleNotificationClick(notification.id)}
                  onDelete={() => handleDeleteNotification(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopup;
