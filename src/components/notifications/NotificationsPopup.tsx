
import React from 'react';
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

interface NotificationsPopupProps {
  className?: string;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ className }) => {
  const { notifications, isLoading, markAsRead, deleteNotification } = useNotifications();
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
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
