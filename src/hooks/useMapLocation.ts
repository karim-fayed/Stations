
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { GasStation } from '@/types/station';
import { fetchNearestStations } from '@/services/stationService';
import { MapTexts } from '@/components/map/types';

export const useMapLocation = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  onSelectStation: (station: GasStation | null) => void,
  texts: MapTexts,
  language: 'ar' | 'en'
) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingNearest, setIsLoadingNearest] = useState(false);
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
      enableHighAccuracy: true,
      timeout: locationAttempts > 0 ? 20000 : 15000, // Increase timeout times
      maximumAge: 0 // Don't use cached position
    };

    // Use watcher ID to be able to clear the watch
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        // Successfully got position
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`User location detected: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);
        
        // Clear the watch as we got a good position
        navigator.geolocation.clearWatch(watchId);
        
        setUserLocation({ latitude, longitude });
        setLocationAttempts(0); // Reset attempts counter on success

        // Move to user location
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 13,
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
  };

  // Find nearest station to user with improved error handling
  const findNearestStation = async (lat?: number, lng?: number) => {
    // Use provided coordinates or stored user location
    const latitude = lat || userLocation?.latitude;
    const longitude = lng || userLocation?.longitude;
    
    if (!latitude || !longitude) {
      // If no location is available, get user location first
      toast({
        title: language === 'ar' ? 'تنبيه' : 'Notice',
        description: language === 'ar' ? 'يجب تحديد موقعك أولاً' : 'Please get your location first',
        variant: 'default',
      });
      getUserLocation();
      return;
    }

    setIsLoadingNearest(true);
    
    // Show searching toast
    toast({
      title: language === 'ar' ? 'جاري البحث' : 'Searching',
      description: language === 'ar' ? 'البحث عن أقرب محطة...' : 'Finding nearest station...',
    });

    try {
      console.log(`Finding nearest station to ${latitude}, ${longitude}`);
      const nearestStations = await fetchNearestStations(latitude, longitude, 1);
      
      if (nearestStations.length > 0) {
        console.log("Found nearest station:", nearestStations[0]);
        onSelectStation(nearestStations[0]);

        // Move map to the station
        map.current?.flyTo({
          center: [nearestStations[0].longitude, nearestStations[0].latitude],
          zoom: 14,
          essential: true,
          duration: 1000
        });

        // Convert distance from meters to km if more than 1000m
        const distanceText = nearestStations[0].distance_meters && nearestStations[0].distance_meters > 1000
          ? `${(nearestStations[0].distance_meters / 1000).toFixed(2)} ${texts.kilometers}`
          : `${Math.round(nearestStations[0].distance_meters || 0)} ${texts.meters}`;

        toast({
          title: texts.nearestStationIs,
          description: `${nearestStations[0].name} (${distanceText})`,
        });
      } else {
        // No stations found
        toast({
          title: language === 'ar' ? 'لم يتم العثور على محطات' : 'No stations found',
          description: language === 'ar' ? 'لا توجد محطات قريبة من موقعك' : 'No stations near your location',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error finding nearest station:', error);
      toast({
        title: texts.locationError,
        description: language === 'ar' ? 'حدث خطأ أثناء البحث عن أقرب محطة' : 'Error finding nearest station',
        variant: "destructive",
      });
    } finally {
      setIsLoadingNearest(false);
    }
  };

  // Show directions to selected station
  const showDirections = (station: GasStation | null) => {
    if (!station) return;

    toast({
      title: texts.showingDirections,
      description: `${texts.directionsTo} ${station.name}`,
    });

    // Open Google Maps directions in new window
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  return {
    userLocation,
    setUserLocation,  // Expose this function to fix the error
    isLoadingLocation,
    isLoadingNearest,
    getUserLocation,
    findNearestStation,
    showDirections
  };
};
