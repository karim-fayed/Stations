
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useBackgroundLocation } from './useBackgroundLocation';
import { Language } from '@/i18n/translations';

interface GeolocationOptions {
  language: Language;
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
  const geoRequestRef = useRef<number | null>(null);
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
    if (locationData && (!userLocation || locationData.accuracy < (userLocation.accuracy || Infinity))) {
      const { latitude, longitude, accuracy } = locationData;
      setUserLocation({ latitude, longitude, accuracy });
      
      // لا نريد الانتقال للموقع تلقائيًا إلا إذا كانت الدقة جيدة
      if (accuracy && accuracy < 50) {
        moveMapToLocation(latitude, longitude);
      }
    }
  }, [locationData]);
  
  // تحديد الموقع على الخريطة
  const moveMapToLocation = useCallback((latitude: number, longitude: number, zoom?: number) => {
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom || 16,
        essential: true,
        duration: 1000
      });
    }
  }, [map]);

  // تحسين أداء الحصول على الموقع الدقيق للمستخدم
  const getUserLocation = useCallback(() => {
    // إلغاء أي طلبات جارية
    if (geoRequestRef.current) {
      navigator.geolocation.clearWatch(geoRequestRef.current);
      geoRequestRef.current = null;
    }
    
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

    // استخدام خيارات عالية الدقة مع مهلات أقصر في البداية ثم زيادتها تدريجياً
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: locationAttempts === 0 ? 15000 : (locationAttempts === 1 ? 20000 : 30000),
      maximumAge: 0
    };

    console.log(`Geolocation attempt ${locationAttempts + 1} with timeout: ${geoOptions.timeout}ms`);

    // استخدام getCurrentPosition بدلاً من watchPosition لتجنب استهلاك البطارية
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // تم الحصول على الموقع بنجاح
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`User location detected: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);
        
        // إذا لم تكن الدقة جيدة بما فيه الكفاية وكانت هناك محاولات أقل من 3، نحاول مرة أخرى
        if (accuracy > 100 && locationAttempts < 2) {
          toast({
            title: language === Language.ARABIC ? 'جاري تحسين الدقة...' : 'Improving accuracy...',
            description: language === Language.ARABIC 
              ? `تم تحديد موقعك بدقة ${accuracy.toFixed(1)} متر، محاولة تحسين...` 
              : `Location detected with ${accuracy.toFixed(1)}m accuracy, trying to improve...`,
          });
          setLocationAttempts(prev => prev + 1);
          
          // ننتظر لحظة قبل المحاولة مرة أخرى
          setTimeout(() => {
            getUserLocation();
          }, 1000);
          return;
        }
        
        setUserLocation({ latitude, longitude, accuracy });
        setLocationAttempts(0);

        // الانتقال إلى موقع المستخدم
        moveMapToLocation(latitude, longitude);

        setIsLoadingLocation(false);

        toast({
          title: texts.locationDetected,
          description: language === Language.ARABIC 
            ? `تم تحديد موقعك بدقة ${accuracy.toFixed(1)} متر`
            : `Your location detected with ${accuracy.toFixed(1)}m accuracy`,
        });
      },
      (error) => {
        // خطأ في الحصول على الموقع
        console.error('Geolocation error:', error);
        
        let errorMsg = '';
        let shouldRetry = false;
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMsg = language === Language.ARABIC ? 'تم رفض إذن تحديد الموقع' : 'Location permission denied';
            shouldRetry = false;
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMsg = language === Language.ARABIC ? 'معلومات الموقع غير متوفرة' : 'Location information unavailable';
            shouldRetry = locationAttempts < 2;
            break;
          case 3: // TIMEOUT
            errorMsg = language === Language.ARABIC ? 'انتهت مهلة طلب تحديد الموقع' : 'Location request timed out';
            shouldRetry = locationAttempts < 2;
            break;
          default:
            errorMsg = error.message || 'حدث خطأ غير معروف';
            shouldRetry = locationAttempts < 2;
        }
        
        if (shouldRetry) {
          // إعادة المحاولة مع مهلة أطول
          setLocationAttempts(prev => prev + 1);
          toast({
            title: language === Language.ARABIC ? 'إعادة محاولة تحديد الموقع' : 'Retrying location detection',
            description: language === Language.ARABIC ? `محاولة ${locationAttempts + 1}/3...` : `Trying attempt ${locationAttempts + 1}/3...`,
          });
          // الانتظار قليلاً قبل إعادة المحاولة
          setTimeout(() => {
            getUserLocation();
          }, 1500);
        } else {
          toast({
            title: texts.locationError,
            description: errorMsg,
            variant: 'destructive',
          });
          setIsLoadingLocation(false);
          
          // محاولة استخدام موقع تقريبي إذا كان متاحًا
          if (locationData) {
            const { latitude, longitude, accuracy } = locationData;
            setUserLocation({ latitude, longitude, accuracy });
            moveMapToLocation(latitude, longitude, 14); // تكبير أقل للموقع التقريبي
            
            toast({
              title: language === Language.ARABIC ? 'تم استخدام موقع تقريبي' : 'Using approximate location',
              description: language === Language.ARABIC 
                ? 'تم استخدام موقع تقريبي بدلاً من الموقع الدقيق' 
                : 'Using approximate location instead of precise location',
            });
          } else {
            // استخدام احتياطي - مركز السعودية
            const saudiCenterLat = 24.774265;
            const saudiCenterLng = 46.738586;
            moveMapToLocation(saudiCenterLat, saudiCenterLng, 5);
          }
        }
      },
      geoOptions
    );
    
    // تحديد مهلة قصوى للعملية بأكملها
    const maxTimeout = 35000; // 35 ثانية كحد أقصى
    const overallTimeoutId = setTimeout(() => {
      if (isLoadingLocation) {
        setIsLoadingLocation(false);
        toast({
          title: language === Language.ARABIC ? 'استغرق وقتًا طويلاً' : 'Taking too long',
          description: language === Language.ARABIC 
            ? 'قد تكون دقة GPS منخفضة في موقعك الحالي. حاول مجددًا لاحقًا.' 
            : 'GPS accuracy might be low in your current location. Try again later.',
          variant: 'default',
        });
        
        // محاولة استخدام موقع تقريبي من تتبع الموقع في الخلفية إذا كان متاحًا
        if (locationData) {
          const { latitude, longitude } = locationData;
          setUserLocation({ latitude, longitude, accuracy: 1000 }); // دقة منخفضة
          moveMapToLocation(latitude, longitude, 14);
        }
      }
    }, maxTimeout);

    // تنظيف المؤقت عند إلغاء المكون
    return () => {
      clearTimeout(overallTimeoutId);
    };
  }, [locationAttempts, language, texts, toast, isLoadingLocation, locationData, moveMapToLocation]);

  return {
    userLocation,
    setUserLocation,
    isLoadingLocation,
    getUserLocation,
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking
  };
};
