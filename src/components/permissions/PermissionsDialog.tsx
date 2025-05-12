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
import { Bell, MapPin, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import securityUtils from "@/utils/securityUtils";

interface PermissionsDialogProps {
  onPermissionsGranted?: () => void;
}

const PermissionsDialog: React.FC<PermissionsDialogProps> = ({
  onPermissionsGranted
}) => {
  const [open, setOpen] = useState(true);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const { toast } = useToast();

  // التحقق من حالة الأذونات عند تحميل المكون
  useEffect(() => {
    // التحقق مما إذا كان المستخدم قد تجاهل طلب الأذونات من قبل
    const hasIgnoredPermissions = securityUtils.secureStorage.getItem('permissions_dialog_ignored', false);

    // التحقق مما إذا كان المستخدم قد منح الأذونات من قبل
    const hasGrantedPermissions = securityUtils.secureStorage.getItem('permissions_granted', false);

    // إذا كان المستخدم قد تجاهل الطلب أو منح الأذونات من قبل، لا تعرض مربع الحوار
    if (hasIgnoredPermissions || hasGrantedPermissions) {
      setOpen(false);
    }
  }, []);

  // طلب جميع الأذونات دفعة واحدة
  const requestAllPermissions = async () => {
    setIsRequestingPermissions(true);

    try {
      // طلب إذن الإشعارات
      if ('Notification' in window) {
        // إذا كان المستخدم قد منح الأذونات، لا تطلب الأذونات مرة أخرى
        const hasGrantedPermissions = securityUtils.secureStorage.getItem('permissions_granted', false);
        if (hasGrantedPermissions) {
          // إظهار رسالة نجاح
          toast({
            title: 'تم تفعيل الأذونات',
            description: 'شكرًا لك! يمكنك الآن الاستفادة من كامل مميزات التطبيق',
            variant: 'default',
          });

          // إغلاق مربع الحوار
          setOpen(false);

          // استدعاء دالة رد الاتصال إذا تم توفيرها
          if (onPermissionsGranted) {
            onPermissionsGranted();
          }
          return;
        }
      }

      // طلب إذن تحديد الموقع
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            // تم منح إذن تحديد الموقع بنجاح
            console.log('تم منح إذن تحديد الموقع');
          },
          (error) => {
            // فشل في الحصول على إذن تحديد الموقع
            console.warn('فشل في الحصول على إذن تحديد الموقع:', error.message);
          }
        );
      }

      // تخزين أن المستخدم قد منح الأذونات
      securityUtils.secureStorage.setItem('permissions_granted', true);

      // إظهار رسالة نجاح
      toast({
        title: 'تم تفعيل الأذونات',
        description: 'شكرًا لك! يمكنك الآن الاستفادة من كامل مميزات التطبيق',
        variant: 'default',
      });

      // إغلاق مربع الحوار
      setOpen(false);

      // استدعاء دالة رد الاتصال إذا تم توفيرها
      if (onPermissionsGranted) {
        onPermissionsGranted();
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  // تجاهل طلب الأذونات
  const ignorePermissions = () => {
    // تخزين تفضيل المستخدم في التخزين المحلي لعدم إظهار الطلب مرة أخرى
    securityUtils.secureStorage.setItem('permissions_dialog_ignored', true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-500" />
            تفعيل الأذونات
          </DialogTitle>
          <DialogDescription className="text-sm">
            لتحسين تجربتك، نحتاج إلى الأذونات التالية:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 my-2">
          <div className="flex items-start gap-2">
            <Bell className="h-4 w-4 text-purple-500 mt-1" />
            <div>
              <h3 className="text-sm font-semibold">الإشعارات</h3>
              <p className="text-xs text-gray-500">للبقاء على اطلاع بآخر المستجدات</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-purple-500 mt-1" />
            <div>
              <h3 className="text-sm font-semibold">تحديد الموقع</h3>
              <p className="text-xs text-gray-500">لعرض المحطات القريبة منك</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={ignorePermissions}
            className="sm:w-auto w-full text-sm h-8"
            disabled={isRequestingPermissions}
          >
            تجاهل
          </Button>

          <Button
            onClick={requestAllPermissions}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 sm:w-auto w-full text-sm h-8"
            disabled={isRequestingPermissions}
          >
            {isRequestingPermissions ? 'جاري التفعيل...' : 'تفعيل الأذونات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;
