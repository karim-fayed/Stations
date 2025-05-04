
import { useState } from 'react';
import { GasStation } from '@/types/station';
import { MapTexts } from '@/components/map/types';
import { useGeolocation } from './useGeolocation';
import { useNearestStation } from './useNearestStation';
import { useDirections } from './useDirections';

export const useMapLocation = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  onSelectStation: (station: GasStation | null) => void,
  texts: MapTexts,
  language: 'ar' | 'en'
) => {
  // Use our new custom hooks
  const { 
    userLocation, 
    setUserLocation, 
    isLoadingLocation, 
    getUserLocation,
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking
  } = useGeolocation({ language, texts, map });

  const { 
    isLoadingNearest, 
    findNearestStation: findNearest 
  } = useNearestStation({ language, texts, map, onSelectStation });

  const { 
    showDirections: showDirectionsToStation 
  } = useDirections({ language, texts });

  // Find nearest station (wrapper function to use the userLocation state)
  const findNearestStation = (lat?: number, lng?: number) => {
    findNearest(lat, lng, userLocation);
  };

  // Show directions (wrapper function to use the userLocation state)
  const showDirections = (station: GasStation | null) => {
    showDirectionsToStation(station, userLocation);
  };

  return {
    userLocation,
    setUserLocation,
    isLoadingLocation,
    isLoadingNearest,
    getUserLocation,
    findNearestStation,
    showDirections,
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking
  };
};
