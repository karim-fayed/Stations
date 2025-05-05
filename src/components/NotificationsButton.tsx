
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

const NotificationsButton = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get user role
      const { data: userRoleData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (!userRoleData) return;
      
      const userRole = userRoleData.role;
      
      // Define valid target roles for this user
      const targetRoles = ['all'];
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

  // Set up real-time subscription
  useEffect(() => {
    fetchUnreadCount();

    // Set up a subscription to the notifications table
    const subscription = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchUnreadCount();
        }
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
