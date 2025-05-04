
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

  // Get user location
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

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
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
          description: texts.pleaseWait,
        });

        // Automatically look for nearest station
        findNearestStation();
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: texts.locationError,
          description: error.message,
          variant: 'destructive',
        });
        setIsLoadingLocation(false);
      }
    );
  };

  // Find nearest station to user
  const findNearestStation = async () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    setIsLoadingNearest(true);

    try {
      const nearestStations = await fetchNearestStations(userLocation.latitude, userLocation.longitude, 1);
      if (nearestStations.length > 0) {
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
          title: texts.locationDetected,
          description: `${texts.nearestStationIs} ${nearestStations[0].name} (${distanceText})`,
        });
      }
    } catch (error) {
      console.error('Error finding nearest station:', error);
      toast({
        title: texts.locationError,
        description: error instanceof Error ? error.message : "Unknown error",
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
