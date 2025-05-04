
import { useState, useEffect, useCallback } from 'react';
import { MapTexts } from '@/components/map/types';
import { useToast } from '@/hooks/use-toast';
import { MAP_TIMEOUT } from '@/utils/environment';

interface UseGeolocationProps {
  language: 'ar' | 'en';
  texts: MapTexts;
  map: React.MutableRefObject<mapboxgl.Map | null>;
}

export const useGeolocation = ({ language, texts, map }: UseGeolocationProps) => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();
  
  // Track the geolocation watch ID for cleanup
  const watchIdRef = { current: 0 };
  
  // Track if there's a pending location request timeout
  const timeoutRef = { current: 0 };

  // Function to get user location
  const getUserLocation = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Show loading toast
    setIsLoadingLocation(true);
    
    const loadingToast = toast({
      title: texts.locationDetecting,
      description: texts.pleaseWait,
      duration: MAP_TIMEOUT,
    });

    // Set a timeout to handle geolocation errors
    timeoutRef.current = window.setTimeout(() => {
      setIsLoadingLocation(false);
      toast({
        title: texts.locationError,
        description: texts.enableLocation,
        variant: 'destructive',
      });
    }, MAP_TIMEOUT);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported by your browser');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Clear timeout when position is received
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = 0;
          }

          // Update state with user location
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          setUserLocation(newLocation);
          setIsLoadingLocation(false);

          // Update toast to show success
          toast({
            title: texts.locationDetected,
            description: '',
            duration: 3000,
          });

          // Center map on user location if available
          if (map.current) {
            map.current.flyTo({
              center: [newLocation.longitude, newLocation.latitude],
              zoom: 14,
            });
          }
        },
        (error) => {
          // Clear timeout
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = 0;
          }

          console.error('Error getting location:', error);
          setIsLoadingLocation(false);

          // Update toast to show error
          toast({
            title: texts.locationError,
            description: error.message || texts.enableLocation,
            variant: 'destructive',
          });
        },
        {
          enableHighAccuracy: true,
          timeout: MAP_TIMEOUT,
          maximumAge: 0,
        }
      );
    } catch (error) {
      // Clear timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = 0;
      }

      console.error('Error in geolocation:', error);
      setIsLoadingLocation(false);

      // Update toast to show error
      toast({
        title: texts.locationError,
        description: error instanceof Error ? error.message : texts.enableLocation,
        variant: 'destructive',
      });
    }
  }, [texts, toast, map]);

  // Start background location tracking
  const startBackgroundLocationTracking = useCallback(() => {
    try {
      if (navigator.geolocation) {
        // Clear any existing watch
        if (watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        
        // Start new watch with less aggressive options
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          (error) => {
            console.log("Background location error:", error.message);
          },
          {
            enableHighAccuracy: false,
            timeout: MAP_TIMEOUT,
            maximumAge: 30000, // Accept positions up to 30 seconds old
          }
        );
      }
    } catch (error) {
      console.error("Error starting background location:", error);
    }
  }, []);

  // Stop background location tracking
  const stopBackgroundLocationTracking = useCallback(() => {
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = 0;
    }
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    userLocation,
    setUserLocation,
    isLoadingLocation,
    getUserLocation,
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking,
  };
};
