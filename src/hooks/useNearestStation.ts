
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { GasStation } from '@/types/station';
import { fetchNearestStations } from '@/services/stationService';
import { MapTexts } from '@/components/map/types';

interface NearestStationOptions {
  language: 'ar' | 'en';
  texts: MapTexts;
  map: React.MutableRefObject<mapboxgl.Map | null>;
  onSelectStation: (station: GasStation | null) => void;
}

export const useNearestStation = ({ 
  language, 
  texts, 
  map, 
  onSelectStation 
}: NearestStationOptions) => {
  const [isLoadingNearest, setIsLoadingNearest] = useState(false);
  const { toast } = useToast();

  // Find nearest station to user with improved error handling
  const findNearestStation = async (latitude?: number, longitude?: number, userLocation?: { latitude: number; longitude: number } | null) => {
    // Use provided coordinates or stored user location
    const lat = latitude || userLocation?.latitude;
    const lng = longitude || userLocation?.longitude;
    
    if (!lat || !lng) {
      // If no location is available, notify the user
      toast({
        title: language === 'ar' ? 'تنبيه' : 'Notice',
        description: language === 'ar' ? 'يجب تحديد موقعك أولاً' : 'Please get your location first',
        variant: 'default',
      });
      return;
    }

    setIsLoadingNearest(true);
    
    // Show searching toast
    toast({
      title: language === 'ar' ? 'جاري البحث' : 'Searching',
      description: language === 'ar' ? 'البحث عن أقرب محطة...' : 'Finding nearest station...',
    });

    try {
      console.log(`Finding nearest station to ${lat}, ${lng}`);
      const nearestStations = await fetchNearestStations(lat, lng, 1);
      
      if (nearestStations.length > 0) {
        console.log("Found nearest station:", nearestStations[0]);
        onSelectStation(nearestStations[0]);

        // Move map to the station
        map.current?.flyTo({
          center: [nearestStations[0].longitude, nearestStations[0].latitude],
          zoom: 15,
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

  return {
    isLoadingNearest,
    findNearestStation
  };
};
