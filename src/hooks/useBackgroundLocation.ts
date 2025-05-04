
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
  const { toast } = useToast();

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
    
    // خيارات عالية الدقة لتحديد الموقع
    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
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
