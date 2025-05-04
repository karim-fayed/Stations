
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

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

  // Get user location with improved accuracy and timeout handling
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

    // Use high accuracy options with longer timeouts
    const geoOptions = {
      enableHighAccuracy: true, // Always request high accuracy
      timeout: locationAttempts > 0 ? 30000 : 20000, // Increase timeout times
      maximumAge: 0 // Don't use cached position
    };

    // Use geolocation watcher instead of single position request
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        // Successfully got position
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`User location detected: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);
        
        // If the accuracy is not good enough, continue watching
        if (accuracy > 30 && locationAttempts < 3) {
          toast({
            title: language === 'ar' ? 'جاري تحسين الدقة...' : 'Improving accuracy...',
            description: language === 'ar' 
              ? `تم تحديد موقعك بدقة ${accuracy.toFixed(1)} متر، محاولة تحسين...` 
              : `Location detected with ${accuracy.toFixed(1)}m accuracy, trying to improve...`,
          });
          setLocationAttempts(prev => prev + 1);
          return; // Continue watching for a better position
        }
        
        // Clear the watch as we got a good position
        navigator.geolocation.clearWatch(watchId);
        
        setUserLocation({ latitude, longitude, accuracy });
        setLocationAttempts(0); // Reset attempts counter on success

        // Move to user location
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 16, // Zoom in closer for better accuracy
          essential: true,
          duration: 1000
        });

        setIsLoadingLocation(false);

        toast({
          title: texts.locationDetected,
          description: language === 'ar' 
            ? `تم تحديد موقعك بدقة ${accuracy.toFixed(1)} متر`
            : `Your location detected with ${accuracy.toFixed(1)}m accuracy`,
        });
      },
      (error) => {
        // Error getting position
        console.error('Geolocation error:', error);
        navigator.geolocation.clearWatch(watchId);
        
        let errorMsg = '';
        let shouldRetry = false;
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = language === 'ar' ? 'تم رفض إذن تحديد الموقع' : 'Location permission denied';
            shouldRetry = false; // Don't retry if permission denied
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = language === 'ar' ? 'معلومات الموقع غير متوفرة' : 'Location information unavailable';
            shouldRetry = locationAttempts < 3; // Retry twice if position unavailable
            break;
          case error.TIMEOUT:
            errorMsg = language === 'ar' ? 'انتهت مهلة طلب تحديد الموقع' : 'Location request timed out';
            shouldRetry = locationAttempts < 3; // Retry twice on timeout
            break;
          default:
            errorMsg = error.message;
            shouldRetry = locationAttempts < 2;
        }
        
        if (shouldRetry) {
          // Retry with longer timeout
          setLocationAttempts(prev => prev + 1);
          toast({
            title: language === 'ar' ? 'إعادة محاولة تحديد الموقع' : 'Retrying location detection',
            description: language === 'ar' ? `محاولة ${locationAttempts + 1}/3...` : `Trying attempt ${locationAttempts + 1}/3...`,
          });
          // Wait a moment before retrying
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
    
    // Set a timeout to stop watching if it's taking too long
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
  };
};
