
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationsLoading from './notifications/NotificationsLoading';
import EmptyNotifications from './notifications/EmptyNotifications';
import NotificationItem from './notifications/NotificationItem';

const NotificationsList = () => {
  const { notifications, isLoading, markAsRead, deleteNotification } = useNotifications();

  if (isLoading) {
    return <NotificationsLoading />;
  }

  if (notifications.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      ))}
    </div>
  );
};

export default NotificationsList;
