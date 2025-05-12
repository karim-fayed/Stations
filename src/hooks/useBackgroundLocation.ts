
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface GeolocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

/**
 * Hook لتحديد موقع المستخدم في الخلفية عند تحميل التطبيق
 * يستخدم للحصول على الموقع بأكبر دقة ممكنة
 */
export const useBackgroundLocation = (language: 'ar' | 'en') => {
  const [locationData, setLocationData] = useState<GeolocationState | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);
  const locationErrorShownRef = useRef(false); // مرجع لتتبع ما إذا تم عرض رسالة الخطأ بالفعل
  const { toast } = useToast();

  // التحقق من حالة الخطأ المخزنة عند بدء تشغيل الهوك
  useEffect(() => {
    // التحقق مما إذا كان قد تم عرض رسالة خطأ تحديد الموقع من قبل
    const errorShown = localStorage.getItem('location_error_shown');
    if (errorShown === 'true') {
      locationErrorShownRef.current = true;
    }
  }, []);

  // التوقف عن متابعة الموقع عند إغلاق التطبيق
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // بدء متابعة الموقع في الخلفية
  const startBackgroundLocationTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    if (watchIdRef.current !== null) {
      // إذا كان هناك متابعة موجودة بالفعل، نوقفها ونبدأ واحدة جديدة
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsLocating(true);

    // خيارات عالية الدقة لتحديد الموقع مع تحسينات للتوافق مع مختلف المتصفحات
    const options = {
      enableHighAccuracy: true,
      timeout: 60000, // زيادة المهلة أكثر لتحسين التوافق مع سفاري وأجهزة آبل
      maximumAge: 30000 // السماح باستخدام موقع مخزن مؤقتًا لتحسين الأداء
    };

    // بدء متابعة الموقع
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;

        console.log(`Background location update: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);

        // تقييم الدقة ومقارنتها بالنتيجة السابقة
        if (locationData) {
          // استخدام البيانات الجديدة فقط إذا كانت الدقة أفضل
          if (accuracy && locationData.accuracy && accuracy < locationData.accuracy) {
            setLocationData({
              latitude,
              longitude,
              accuracy,
              timestamp
            });
          }
          // أو إذا كانت البيانات قديمة (أكثر من دقيقتين)
          else if (timestamp - locationData.timestamp > 120000) {
            setLocationData({
              latitude,
              longitude,
              accuracy,
              timestamp
            });
          }
        } else {
          // استخدام أول قراءة متاحة
          setLocationData({
            latitude,
            longitude,
            accuracy,
            timestamp
          });
        }

        // إذا كانت الدقة جيدة جدًا (أقل من 20 متر)، يمكننا التوقف عن المتابعة
        if (accuracy && accuracy < 20) {
          setIsLocating(false);
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        }
        // إذا كانت المحاولات كثيرة، نتوقف أيضًا
        else if (attemptsRef.current > 5) {
          setIsLocating(false);
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        }

        attemptsRef.current++;
      },
      (err) => {
        console.error('Background location error:', err);
        setError(err.message);
        setIsLocating(false);

        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        // تحسين معالجة أخطاء تحديد الموقع
        if (err.code === err.PERMISSION_DENIED) {
          // إظهار تنبيه فقط عند حدوث خطأ في الإذن وإذا لم يتم عرضه من قبل
          if (!locationErrorShownRef.current) {
            locationErrorShownRef.current = true; // تعيين العلم لمنع ظهور الرسالة مرة أخرى

            // عرض رسالة الخطأ
            const toastId = toast({
              title: language === 'ar' ? 'خطأ في تحديد الموقع' : 'Location Error',
              description: language === 'ar'
                ? 'يرجى تفعيل خدمة تحديد المواقع للاستفادة من كامل مميزات التطبيق'
                : 'Please enable location services for full app functionality',
              variant: "default",
              duration: 5000, // عرض الرسالة لمدة 5 ثوانٍ فقط
            });

            // تخزين حالة الخطأ في التخزين المحلي لمنع ظهور الرسالة مرة أخرى
            localStorage.setItem('location_error_shown', 'true');

            console.log('Location permission denied, toast shown with ID:', toastId);
          } else {
            console.log('Location permission denied, toast already shown');
          }
        } else if (err.code === err.TIMEOUT) {
          // محاولة إعادة تشغيل تحديد الموقع بعد فترة قصيرة في حالة انتهاء المهلة
          if (attemptsRef.current < 3) {
            attemptsRef.current++;
            console.log(`Location timeout, retrying (attempt ${attemptsRef.current}/3)...`);

            // إعادة المحاولة بعد فترة أطول (5 ثوانٍ)
            setTimeout(() => {
              startBackgroundLocationTracking();
            }, 5000);
          } else {
            // إذا فشلت المحاولات المتكررة، نستخدم خيارات أقل دقة
            console.log('Multiple location timeouts, trying with lower accuracy settings...');

            // استخدام خيارات أقل دقة للمحاولة الأخيرة
            const fallbackOptions = {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000
            };

            // محاولة أخيرة باستخدام getCurrentPosition بدلاً من watchPosition
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const timestamp = position.timestamp;

                console.log(`Fallback location obtained: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);

                setLocationData({
                  latitude,
                  longitude,
                  accuracy,
                  timestamp
                });

                setIsLocating(false);
              },
              (fallbackErr) => {
                console.error('Fallback location error:', fallbackErr);
                setIsLocating(false);
              },
              fallbackOptions
            );
          }
        }
      },
      options
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  };

  // إيقاف متابعة الموقع في الخلفية
  const stopBackgroundLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLocating(false);
    }
  };

  return {
    locationData,
    isLocating,
    error,
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking
  };
};
