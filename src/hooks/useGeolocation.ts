
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useBackgroundLocation } from './useBackgroundLocation';

interface GeolocationOptions {
  language: 'ar' | 'en';
  texts: {
    locationDetecting: string;
    pleaseWait: string;
    locationError: string;
    enableLocation: string;
    locationDetected: string;
  };
  map: React.MutableRefObject<mapboxgl.Map | null>;
}

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const useGeolocation = ({ language, texts, map }: GeolocationOptions) => {
  const [userLocation, setUserLocation] = useState<LocationState | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationAttempts, setLocationAttempts] = useState(0);
  const { toast } = useToast();
  
  // استخدام hook تحديد الموقع في الخلفية
  const { 
    locationData, 
    isLocating, 
    startBackgroundLocationTracking, 
    stopBackgroundLocationTracking 
  } = useBackgroundLocation(language);
  
  // تحديث الموقع عندما تتغير البيانات من تحديد الموقع في الخلفية
  useEffect(() => {
    if (locationData && !userLocation) {
      const { latitude, longitude, accuracy } = locationData;
      setUserLocation({ latitude, longitude, accuracy });
      
      // لا نريد الانتقال للموقع تلقائيًا إلا إذا كانت الدقة جيدة
      if (accuracy && accuracy < 50) {
        moveMapToLocation(latitude, longitude);
      }
    }
  }, [locationData]);
  
  // تحديد الموقع على الخريطة
  const moveMapToLocation = (latitude: number, longitude: number, zoom?: number) => {
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom || 16,
        essential: true,
        duration: 1000
      });
    }
  };

  // تحسين أداء الحصول على الموقع الدقيق للمستخدم
  const getUserLocation = () => {
    setIsLoadingLocation(true);

    toast({
      title: texts.locationDetecting,
      description: texts.pleaseWait,
    });

    if (!navigator.geolocation) {
      toast({
        title: texts.locationError,
        description: texts.enableLocation,
        variant: 'destructive',
      });
      setIsLoadingLocation(false);
      return;
    }

    // استخدام خيارات عالية الدقة مع مهلات أطول
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: locationAttempts > 0 ? 30000 : 20000,
      maximumAge: 0
    };

    // استخدام متابعة الموقع بدلاً من طلب موقع واحد
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        // تم الحصول على الموقع بنجاح
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`User location detected: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);
        
        // إذا لم تكن الدقة جيدة بما فيه الكفاية، نستمر في المتابعة
        if (accuracy > 30 && locationAttempts < 3) {
          toast({
            title: language === 'ar' ? 'جاري تحسين الدقة...' : 'Improving accuracy...',
            description: language === 'ar' 
              ? `تم تحديد موقعك بدقة ${accuracy.toFixed(1)} متر، محاولة تحسين...` 
              : `Location detected with ${accuracy.toFixed(1)}m accuracy, trying to improve...`,
          });
          setLocationAttempts(prev => prev + 1);
          return;
        }
        
        // إلغاء المتابعة لأننا حصلنا على موقع جيد
        navigator.geolocation.clearWatch(watchId);
        
        setUserLocation({ latitude, longitude, accuracy });
        setLocationAttempts(0);

        // الانتقال إلى موقع المستخدم
        moveMapToLocation(latitude, longitude);

        setIsLoadingLocation(false);

        toast({
          title: texts.locationDetected,
          description: language === 'ar' 
            ? `تم تحديد موقعك بدقة ${accuracy.toFixed(1)} متر`
            : `Your location detected with ${accuracy.toFixed(1)}m accuracy`,
        });
      },
      (error) => {
        // خطأ في الحصول على الموقع
        console.error('Geolocation error:', error);
        navigator.geolocation.clearWatch(watchId);
        
        let errorMsg = '';
        let shouldRetry = false;
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = language === 'ar' ? 'تم رفض إذن تحديد الموقع' : 'Location permission denied';
            shouldRetry = false;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = language === 'ar' ? 'معلومات الموقع غير متوفرة' : 'Location information unavailable';
            shouldRetry = locationAttempts < 3;
            break;
          case error.TIMEOUT:
            errorMsg = language === 'ar' ? 'انتهت مهلة طلب تحديد الموقع' : 'Location request timed out';
            shouldRetry = locationAttempts < 3;
            break;
          default:
            errorMsg = error.message;
            shouldRetry = locationAttempts < 2;
        }
        
        if (shouldRetry) {
          // إعادة المحاولة مع مهلة أطول
          setLocationAttempts(prev => prev + 1);
          toast({
            title: language === 'ar' ? 'إعادة محاولة تحديد الموقع' : 'Retrying location detection',
            description: language === 'ar' ? `محاولة ${locationAttempts + 1}/3...` : `Trying attempt ${locationAttempts + 1}/3...`,
          });
          // الانتظار قليلاً قبل إعادة المحاولة
          setTimeout(getUserLocation, 1000);
        } else {
          toast({
            title: texts.locationError,
            description: errorMsg,
            variant: 'destructive',
          });
          setIsLoadingLocation(false);
        }
      },
      geoOptions
    );
    
    // تحديد مهلة للتوقف عن المتابعة إذا كانت تستغرق وقتًا طويلاً
    setTimeout(() => {
      if (isLoadingLocation) {
        navigator.geolocation.clearWatch(watchId);
        toast({
          title: language === 'ar' ? 'استغرق وقتًا طويلاً' : 'Taking too long',
          description: language === 'ar' ? 'قد تكون دقة GPS منخفضة في موقعك الحالي' : 'GPS accuracy might be low in your current location',
          variant: 'default',
        });
        setIsLoadingLocation(false);
      }
    }, 40000); // 40 second timeout
  };

  return {
    userLocation,
    setUserLocation,
    isLoadingLocation,
    getUserLocation,
    startBackgroundLocationTracking,  // إضافة الوظائف الجديدة
    stopBackgroundLocationTracking
  };
};
