
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
  target_role?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get user's role
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (userRoleError) throw userRoleError;
      
      // Define valid target roles for this user with explicit typing
      const targetRoles: string[] = ['all'];
      if (userRoleData?.role) {
        targetRoles.push(userRoleData.role);
      }
      
      // Fetch notifications for this user based on role
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
        title: 'خطأ في جلب الإشعارات',
        description: 'لم نتمكن من جلب الإشعارات. الرجاء المحاولة مرة أخرى لاحقا.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true } 
          : notification
      ));
      
      toast({
        title: 'تم تحديد الإشعار كمقروء',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: 'destructive',
        title: 'حدثت مشكلة',
        description: 'لم نتمكن من تحديد الإشعار كمقروء.',
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
      setNotifications(notifications.filter(notification => notification.id !== id));
      
      toast({
        title: 'تم حذف الإشعار بنجاح',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        variant: 'destructive',
        title: 'حدثت مشكلة',
        description: 'لم نتمكن من حذف الإشعار.',
      });
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading,
    markAsRead,
    deleteNotification,
    fetchNotifications
  };
};
