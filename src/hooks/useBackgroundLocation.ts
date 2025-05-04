
import { useState, useEffect, useRef } from 'react';
import { Language } from '@/i18n/translations';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export const useBackgroundLocation = (language: Language) => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const updateIntervalRef = useRef<number>(300000); // Default 5 minutes (300000ms)

  // Start background location tracking with controlled frequency
  const startBackgroundLocationTracking = (minAccuracy = 1000, desiredInterval = 300000) => {
    // Only start if not already tracking
    if (watchIdRef.current !== null) {
      return;
    }

    updateIntervalRef.current = desiredInterval;
    setIsLocating(true);

    // Use high accuracy but with a reasonable timeout
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Accept cached positions up to 1 minute old
    };

    // Initial position request for immediate feedback
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.info(`Initial location detected: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);
        
        // Only update if accuracy is better than the minimum threshold
        if (accuracy < minAccuracy) {
          setLocationData({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp
          });
          lastUpdateRef.current = Date.now();
        }
      },
      (error) => {
        console.warn(`Initial geolocation error: ${error.message}`);
        // Fall back to IP-based location or continue with watch
      },
      options
    );

    // Set up watchPosition with throttling to prevent excessive updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        const { latitude, longitude, accuracy } = position.coords;
        
        // Log location updates for debugging, but don't flood the console
        if (now - lastUpdateRef.current > 15000) { // Log at most every 15 seconds
          console.info(`Background location update: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);
        }

        // Only update if:
        // 1. Time since last update exceeds the desired interval OR
        // 2. We have a significantly better accuracy than before
        const timeSinceLastUpdate = now - lastUpdateRef.current;
        const shouldUpdateTime = timeSinceLastUpdate > updateIntervalRef.current;
        const shouldUpdateAccuracy = locationData && 
                                     accuracy < minAccuracy && 
                                     accuracy < (locationData.accuracy || Infinity) * 0.7; // 30% improvement
        
        if (shouldUpdateTime || shouldUpdateAccuracy) {
          setLocationData({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp
          });
          lastUpdateRef.current = now;
        }
      },
      (error) => {
        console.warn(`Background geolocation watch error: ${error.message}`);
        // Do not set isLocating to false here, as the watch continues despite errors
      },
      {
        enableHighAccuracy: false, // Use lower accuracy for background to save battery
        timeout: 10000,
        maximumAge: 120000 // Accept cached positions up to 2 minutes old for background
      }
    );
  };

  // Stop background location tracking
  const stopBackgroundLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLocating(false);
      console.info("Background location tracking stopped");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopBackgroundLocationTracking();
    };
  }, []);

  return {
    locationData,
    isLocating,
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking
  };
};
