import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { notificationService } from '@/services/NotificationService';

interface NotificationPermissionDialogProps {
  onPermissionGranted?: () => void;
}

const NotificationPermissionDialog: React.FC<NotificationPermissionDialogProps> = ({
  onPermissionGranted
}) => {
  const [open, setOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | null>(null);

  // التحقق من حالة إذن الإشعارات عند تحميل المكون
  useEffect(() => {
    // التحقق من دعم الإشعارات في المتصفح
    if (!('Notification' in window)) {
      console.log('هذا المتصفح لا يدعم إشعارات سطح المكتب');
      return;
    }

    // التحقق من حالة الإذن الحالية
    const currentPermission = Notification.permission;
    setPermissionState(currentPermission);

    // إذا لم يتم طلب الإذن بعد، اعرض مربع الحوار
    if (currentPermission !== 'granted' && currentPermission !== 'denied') {
      setOpen(true);
    }
  }, []);

  // طلب إذن الإشعارات
  const requestPermission = async () => {
    try {
      // تهيئة خدمة الإشعارات
      notificationService.initialize();

      // طلب إذن الإشعارات
      const permission = await notificationService.requestPermission();
      setPermissionState(permission);

      if (permission === 'granted') {
        // إرسال إشعار ترحيبي
        notificationService.sendWelcomeNotification();

        // إغلاق مربع الحوار
        setOpen(false);

        // استدعاء دالة رد الاتصال إذا تم توفيرها
        if (onPermissionGranted) {
          onPermissionGranted();
        }
      } else if (permission === 'denied') {
        // إغلاق مربع الحوار إذا تم رفض الإذن
        setOpen(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // تجاهل طلب الإذن
  const ignorePermission = () => {
    setOpen(false);
    // يمكن تخزين تفضيل المستخدم في التخزين المحلي لعدم إظهار الطلب مرة أخرى
    localStorage.setItem('notification_permission_ignored', 'true');
  };

  // لا تعرض شيئًا إذا كان الإذن ممنوحًا بالفعل أو إذا كان المتصفح لا يدعم الإشعارات
  if (permissionState === 'granted' || !('Notification' in window)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            تفعيل الإشعارات
          </DialogTitle>
          <DialogDescription>
            هل ترغب في تلقي إشعارات مهمة من التطبيق؟ يمكنك تفعيل الإشعارات للبقاء على اطلاع بآخر المستجدات.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
            <div className="bg-purple-100 p-3 rounded-full">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium">تلقي إشعارات مهمة</h4>
              <p className="text-sm text-gray-500">ستتلقى إشعارات عن التحديثات المهمة والإعلانات الجديدة</p>
            </div>
          </div>

          {permissionState === 'denied' && (
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
              <div className="bg-red-100 p-3 rounded-full">
                <BellOff className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">تم حظر الإشعارات</h4>
                <p className="text-sm text-gray-500">
                  لقد قمت بحظر الإشعارات. يرجى تغيير إعدادات المتصفح للسماح بالإشعارات من هذا الموقع.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={ignorePermission}
            className="sm:w-auto w-full"
          >
            تجاهل
          </Button>

          <Button
            onClick={requestPermission}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 sm:w-auto w-full"
            disabled={permissionState === 'denied'}
          >
            {permissionState === 'denied' ? 'تم حظر الإشعارات' : 'تفعيل الإشعارات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionDialog;
