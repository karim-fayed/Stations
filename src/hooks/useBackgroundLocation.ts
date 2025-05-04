
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
  const timeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  // التوقف عن متابعة الموقع عند إغلاق التطبيق
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // تنظيف timeout إذا كان موجود
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
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

    // تنظيف timeout إذا كان موجود
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsLocating(true);
    setError(null);
    
    // خيارات عالية الدقة لتحديد الموقع
    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // زيادة timeout إلى 30 ثانية
      maximumAge: 0
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

        // إعادة تعيين timeout في كل مرة نحصل فيها على تحديث
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
      },
      (err) => {
        console.error('Background location error:', err);
        setError(err.message);
        setIsLocating(false);
        
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        // إظهار تنبيه فقط عند حدوث خطأ في الإذن، لا نريد إزعاج المستخدم
        if (err.code === err.PERMISSION_DENIED) {
          toast({
            title: language === 'ar' ? 'خطأ في تحديد الموقع' : 'Location Error',
            description: language === 'ar' 
              ? 'يرجى تفعيل خدمة تحديد المواقع للاستفادة من كامل مميزات التطبيق' 
              : 'Please enable location services for full app functionality',
            variant: "default",
          });
        } else if (err.code === err.TIMEOUT) {
          // محاولة إعادة التشغيل عند حدوث timeout
          if (attemptsRef.current < 3) {
            console.log(`Timeout occurred, retrying (attempt ${attemptsRef.current + 1}/3)...`);
            attemptsRef.current++;
            
            // إعادة المحاولة بعد ثانيتين
            setTimeout(() => {
              startBackgroundLocationTracking();
            }, 2000);
          } else {
            // إظهار رسالة إذا استمر timeout بعد 3 محاولات
            toast({
              title: language === 'ar' ? 'تعذر تحديد الموقع' : 'Location Detection Failed',
              description: language === 'ar' 
                ? 'تأكد من تفعيل خدمات تحديد المواقع وأنك متصل بالإنترنت' 
                : 'Make sure location services are enabled and you are connected to the internet',
              variant: "default",
            });
          }
        }
      },
      options
    );

    // إضافة timeout شامل للتأكد من أننا لن ننتظر إلى الأبد
    timeoutRef.current = window.setTimeout(() => {
      if (isLocating && !locationData) {
        console.log('Global location timeout reached after 60 seconds');
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        setIsLocating(false);
        
        // إذا لم نحصل على أي بيانات موقع بعد 60 ثانية
        if (!locationData) {
          toast({
            title: language === 'ar' ? 'استغرق وقتًا طويلاً' : 'Taking too long',
            description: language === 'ar' 
              ? 'قد تكون دقة GPS منخفضة في موقعك الحالي' 
              : 'GPS accuracy might be low in your current location',
            variant: "default",
          });
        }
      }
      
      timeoutRef.current = null;
    }, 60000); // timeout شامل لمدة 60 ثانية

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
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
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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
