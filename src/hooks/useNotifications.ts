
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
      // جلب جلسة المستخدم الحالية
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error('No user found in session');
      
      // الحصول على دور المستخدم من جدول admin_users
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (userRoleError) throw userRoleError;
      
      // تحديد الأدوار المستهدفة لهذا المستخدم
      let targetRoles = ['all'];
      if (userRoleData?.role) {
        targetRoles.push(userRoleData.role);
      }
      
      // جلب الإشعارات الموجهة لدور هذا المستخدم
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
    
    // الاشتراك في تحديثات الإشعارات
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        () => fetchNotifications()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // تحديث الحالة المحلية
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
      
      // تحديث الحالة المحلية
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
    deleteNotification
  };
};
