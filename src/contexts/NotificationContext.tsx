
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  target_role?: string;
  image_url?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    // Check user authentication status
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: userData, error } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (!error && userData) {
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
      }
    });

    // Get initial auth state
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        supabase
          .from('admin_users')
          .select('role')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setUserRole(data.role);
            }
          });
      }
    });

    // Load notifications initially
    loadNotifications();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });

      if (userRole) {
        // If user has a role, show notifications for that role or null (everyone)
        query = query.or(`target_role.is.null,target_role.eq.${userRole}`);
      } else {
        // For public users, only show notifications targeted to public (null)
        query = query.is('target_role', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select();

      if (error) {
        console.error('Error adding notification:', error);
        return;
      }

      if (data && data.length > 0) {
        setNotifications(prev => [data[0], ...prev]);
      }
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loadNotifications, 
      markAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
