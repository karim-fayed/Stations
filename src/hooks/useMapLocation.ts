
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
  const { toast } = useToast();

  // Get user location with improved accuracy
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

    // Use high accuracy options
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`User location detected: ${latitude}, ${longitude}, accuracy: ${position.coords.accuracy}m`);
        
        setUserLocation({ latitude, longitude });

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
            ? `تم تحديد موقعك بدقة ${position.coords.accuracy.toFixed(1)} متر`
            : `Your location detected with ${position.coords.accuracy.toFixed(1)}m accuracy`,
        });

        // Let UI update first, then look for nearest station
        setTimeout(() => findNearestStation(), 500);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = '';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = language === 'ar' ? 'تم رفض إذن تحديد الموقع' : 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = language === 'ar' ? 'معلومات الموقع غير متوفرة' : 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = language === 'ar' ? 'انتهت مهلة طلب تحديد الموقع' : 'Location request timed out';
            break;
          default:
            errorMsg = error.message;
        }
        
        toast({
          title: texts.locationError,
          description: errorMsg,
          variant: 'destructive',
        });
        setIsLoadingLocation(false);
      },
      geoOptions
    );
  };

  // Find nearest station to user with better error handling
  const findNearestStation = async () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    setIsLoadingNearest(true);

    try {
      console.log(`Finding nearest station to ${userLocation.latitude}, ${userLocation.longitude}`);
      const nearestStations = await fetchNearestStations(userLocation.latitude, userLocation.longitude, 1);
      
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
          variant: "warning",
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
    isLoadingLocation,
    isLoadingNearest,
    getUserLocation,
    findNearestStation,
    showDirections
  };
};
