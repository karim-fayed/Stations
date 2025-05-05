
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Trash } from "lucide-react";
import CreateNotificationDialog from './CreateNotificationDialog';
import { Notification } from '@/hooks/useNotifications';
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();

  // التحقق من صلاحية المستخدم كمالك
  useEffect(() => {
    const checkOwnerRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: userRoleData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setIsOwner(userRoleData?.role === 'owner');
      } catch (error) {
        console.error('Error checking owner role:', error);
      }
    };

    checkOwnerRole();
  }, []);

  // جلب قائمة الإشعارات
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // إعداد الاشتراك في التغييرات على جدول الإشعارات
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

  // حذف الإشعار
  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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

  const notificationCreated = () => {
    fetchNotifications();
    toast({
      title: 'تم إنشاء الإشعار بنجاح',
      description: 'تم إنشاء وإرسال الإشعار لجميع المستخدمين المستهدفين'
    });
  };

  // حالة التحميل
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة الإشعارات</h2>
        
        {isOwner && (
          <CreateNotificationDialog 
            triggerClassName="bg-gradient-to-r from-noor-purple to-noor-orange hover:opacity-90 text-white"
            onNotificationCreated={notificationCreated}
          />
        )}
      </div>

      {!isOwner && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-4">
          <p className="font-medium">ملاحظة: فقط مالك النظام يمكنه إنشاء إشعارات جديدة.</p>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-500 mb-2">لا توجد إشعارات</h3>
          <p className="text-gray-400">لم يتم إنشاء أي إشعارات بعد</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteNotification(notification.id)} 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">الهدف: </span>
                    {notification.target_role === 'all' ? 'الكل' : 
                     notification.target_role === 'admin' ? 'المشرفون' : 'المالكون'}
                    {' • '}
                    <span>{format(new Date(notification.created_at), "dd MMMM yyyy 'الساعة' HH:mm", { locale: ar })}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {notification.image_url && (
                    <div className="mb-3">
                      <img 
                        src={notification.image_url} 
                        alt="صورة الإشعار" 
                        className="w-full max-h-40 object-contain rounded-md"
                      />
                    </div>
                  )}
                  <p className="text-gray-700">{notification.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;
