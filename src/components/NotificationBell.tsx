
import React, { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

import { useNotifications } from '@/contexts/NotificationContext';
import { useLanguage } from '@/i18n/LanguageContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'PP', { locale: language === 'ar' ? ar : undefined });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] min-w-4 h-4 flex items-center justify-center rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
              <p>
                {language === 'ar' 
                  ? 'لا توجد إشعارات حالياً' 
                  : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`
                    p-4 rounded-lg border transition-all
                    ${notification.is_read ? 'bg-background' : 'bg-muted/50 border-primary/20'} 
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${!notification.is_read ? 'text-primary' : ''}`}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6" 
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.content}</p>
                  {notification.image_url && (
                    <img 
                      src={notification.image_url} 
                      alt=""
                      className="w-full h-auto rounded-md my-2 object-cover"
                    />
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDate(notification.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationBell;
