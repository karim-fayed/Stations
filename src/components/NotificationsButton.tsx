
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

const NotificationsButton = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // صوت الإشعار
  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(e => console.error('Error playing notification sound:', e));
  };

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      // جلب المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // جلب دور المستخدم
      const { data: userRoleData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (!userRoleData) return;
      
      const userRole = userRoleData.role;
      
      // تحديد الأدوار المستهدفة لهذا المستخدم بنوع محدد للمصفوفة
      let targetRoles = ['all'] as string[]; 
      if (userRole) {
        targetRoles.push(userRole);
      }
      
      // عد الإشعارات غير المقروءة
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

  // التعامل مع الإشعارات الجديدة
  const handleNewNotification = async (payload: any) => {
    fetchUnreadCount();
    
    // التحقق إذا كان هذا إشعار جديد
    if (payload.eventType === 'INSERT') {
      try {
        // جلب المستخدم الحالي
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // جلب دور المستخدم
        const { data: userRoleData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (!userRoleData) return;
        
        const userRole = userRoleData.role;
        
        // التحقق مما إذا كان هذا الإشعار موجه للمستخدم
        const notification = payload.new;
        if (notification.target_role === 'all' || notification.target_role === userRole) {
          // عرض إشعار في أعلى الشاشة
          toast({
            title: notification.title,
            description: notification.content,
            className: "toast-welcome"
          });
          
          // تشغيل الصوت إذا كان الإشعار يتطلب ذلك
          if (notification.play_sound) {
            playNotificationSound();
          }
        }
      } catch (error) {
        console.error('Error processing new notification:', error);
      }
    }
  };

  // إعداد الاشتراك في الوقت الحقيقي
  useEffect(() => {
    fetchUnreadCount();

    // إعداد اشتراك في جدول الإشعارات
    const subscription = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        handleNewNotification
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
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
