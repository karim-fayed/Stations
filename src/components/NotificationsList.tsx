
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLanguage } from '@/i18n/LanguageContext';

interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  image_url?: string;
  target_role?: string;
}

const NotificationsList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

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
      
      const userRole = userRoleData?.role;
      
      // Fetch notifications for this user based on role
      // Using explicit OR conditions instead of the .or method to avoid deep instantiation
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('target_role', ['all', userRole])
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-noor-purple"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-1">لا توجد إشعارات</h3>
          <p className="text-muted-foreground">سيظهر هنا أي إشعار جديد يُرسل لك</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className={notification.is_read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-noor-purple'}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {!notification.is_read && (
                <span className="h-2 w-2 bg-noor-orange rounded-full"></span>
              )}
              {notification.title}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? format(new Date(notification.created_at), "dd MMMM yyyy 'الساعة' HH:mm", { locale: ar })
                : format(new Date(notification.created_at), "dd MMMM yyyy 'at' HH:mm")
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notification.image_url && (
              <div className="mb-4">
                <img 
                  src={notification.image_url} 
                  alt="صورة الإشعار" 
                  className="w-full h-auto rounded-md"
                />
              </div>
            )}
            <p>{notification.content}</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {!notification.is_read && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAsRead(notification.id)}
              >
                <Check className="ml-1 h-4 w-4" />
                تحديد كمقروء
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => deleteNotification(notification.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="ml-1 h-4 w-4" />
              حذف
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default NotificationsList;
