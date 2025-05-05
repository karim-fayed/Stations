import { soundService } from './SoundService';
import logger from '@/utils/logger';

// خدمة إدارة إشعارات سطح المكتب
class NotificationService {
  private static instance: NotificationService;
  private isInitialized: boolean = false;
  private notificationSupported: boolean = false;

  private constructor() {
    // التحقق من دعم الإشعارات في المتصفح
    this.notificationSupported = 'Notification' in window;
  }

  // الحصول على نسخة واحدة من الخدمة (Singleton)
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // تهيئة الخدمة
  public initialize(): void {
    if (this.isInitialized) return;

    try {
      if (!this.notificationSupported) {
        logger.debug('هذا المتصفح لا يدعم إشعارات سطح المكتب');
        return;
      }

      this.isInitialized = true;
      logger.debug('Notification service initialized successfully');

      // تأخير التحقق من إذن الإشعارات لتحسين الأداء
      setTimeout(() => {
        this.checkNotificationPermission();
      }, 5000); // تأخير 5 ثوانٍ
    } catch (error) {
      logger.error('Error initializing notification service:', error);
    }
  }

  // التحقق من إذن الإشعارات
  private checkNotificationPermission(): void {
    try {
      if (!this.notificationSupported) return;

      const permission = Notification.permission;
      logger.debug(`Current notification permission: ${permission}`);
    } catch (error) {
      logger.error('Error checking notification permission:', error);
    }
  }

  // التحقق من حالة إذن الإشعارات
  public getPermissionState(): NotificationPermission | null {
    if (!this.notificationSupported) return null;
    return Notification.permission;
  }

  // طلب إذن الإشعارات
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.notificationSupported) {
      logger.debug('هذا المتصفح لا يدعم إشعارات سطح المكتب');
      return 'denied';
    }

    try {
      // تهيئة خدمة الصوت وتشغيل صوت صامت لفتح سياق الصوت
      soundService.initialize();

      // طلب إذن الإشعارات
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // إرسال إشعار
  public sendNotification(
    title: string,
    options?: NotificationOptions & { playSound?: boolean }
  ): Notification | null {
    if (!this.notificationSupported) {
      logger.debug('هذا المتصفح لا يدعم إشعارات سطح المكتب');
      return null;
    }

    if (Notification.permission !== 'granted') {
      logger.debug('لم يتم منح إذن الإشعارات');
      return null;
    }

    try {
      // إنشاء الإشعار
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        ...options
      });

      // تشغيل صوت الإشعار إذا كان مطلوبًا
      if (options?.playSound !== false) {
        soundService.playSound('notification');
      }

      // إغلاق الإشعار بعد 5 ثوانٍ أو المدة المحددة
      const timeout = options?.timeout || 5000;
      setTimeout(() => notification.close(), timeout);

      return notification;
    } catch (error) {
      logger.error('Error sending notification:', error);
      return null;
    }
  }

  // إرسال إشعار ترحيبي
  public sendWelcomeNotification(): Notification | null {
    return this.sendNotification('تم تفعيل الإشعارات', {
      body: 'ستتلقى الآن إشعارات مهمة من التطبيق',
      playSound: true
    });
  }

  // إرسال إشعار جديد
  public sendNewNotification(
    title: string,
    content: string,
    options?: NotificationOptions & { playSound?: boolean }
  ): Notification | null {
    return this.sendNotification(title, {
      body: content,
      playSound: true,
      ...options
    });
  }
}

// تصدير نسخة واحدة من الخدمة
export const notificationService = NotificationService.getInstance();
