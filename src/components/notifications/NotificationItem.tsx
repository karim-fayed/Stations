
import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Check, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Notification } from '@/hooks/useNotifications';
import { useLanguage } from '@/i18n/LanguageContext';

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  const { language } = useLanguage();

  return (
    <Card 
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
            onClick={() => onMarkAsRead(notification.id)}
          >
            <Check className="ml-1 h-4 w-4" />
            تحديد كمقروء
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(notification.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash className="ml-1 h-4 w-4" />
          حذف
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationItem;
