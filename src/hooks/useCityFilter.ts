
import { useCallback, useState } from 'react';
import { GasStation, SaudiCity } from '@/types/station';
import { useToast } from "@/hooks/use-toast";

export const useCityFilter = (
  stations: GasStation[],
  cities: SaudiCity[],
  language: 'ar' | 'en',
  map: React.MutableRefObject<mapboxgl.Map | null>,
  setFilteredStations: (stations: GasStation[]) => void
) => {
  const { toast } = useToast();
  const [isLoadingCity, setIsLoadingCity] = useState<boolean>(false);
  const [cityStationsCache, setCityStationsCache] = useState<{[cityName: string]: GasStation[]}>({});

  // Detect if device is likely low performance
  const detectLowPerformanceDevice = useCallback(() => {
    // Check for various indicators of low-performance devices
    const isSlowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return isSlowCPU || isMobile;
  }, []);

  // Calculate distance between two geographic points
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }, []);

  // Helper to handle city filter errors
  const handleCityError = useCallback((error: any) => {
    toast({
      title: language === 'ar' ? 'خطأ في تصفية المحطات' : 'Error filtering stations',
      description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
      variant: "destructive",
    });
  }, [language, toast]);

  // Enhanced function to move map to city with faster response
  const moveMapToCity = useCallback((cityName: string, stationCount: number) => {
    const city = cities.find(c => c.name === cityName || c.nameEn === cityName);

    if (!map.current || !city) {
      console.error("Cannot move map: map instance or city not found", {
        mapExists: !!map.current,
        cityFound: !!city,
        cityName
      });
      return;
    }

    console.log(`Moving map to city: ${cityName} at coordinates: ${city.longitude}, ${city.latitude}`);

    // Calculate appropriate zoom level based on station count and city size
    let zoomLevel = city.zoom || 11;

    // Adjust zoom level based on station count for better visibility
    if (stationCount > 100) {
      zoomLevel -= 0.5; // Zoom out a bit for many stations
    } else if (stationCount < 10) {
      zoomLevel += 0.5; // Zoom in a bit for few stations
    }

    // Apply performance adjustments if needed
    if (detectLowPerformanceDevice()) {
      zoomLevel = Math.max(zoomLevel - 1, 8);
    }

    // Check if map is already at this location to avoid unnecessary movement
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();
    const isAlreadyAtLocation =
      Math.abs(currentCenter.lng - city.longitude) < 0.01 &&
      Math.abs(currentCenter.lat - city.latitude) < 0.01 &&
      Math.abs(currentZoom - zoomLevel) < 0.5;

    // If already at location, just update the UI without moving the map
    if (isAlreadyAtLocation) {
      console.log(`Map already at ${cityName}, skipping movement`);

      // Just trigger a repaint to ensure markers are displayed correctly
      map.current.triggerRepaint();

      // Show toast notification
      toast({
        title: language === 'ar' ? `${city?.name}` : `${city?.nameEn}`,
        description: language === 'ar'
          ? `تم العثور على ${stationCount} محطة في/بالقرب من المدينة`
          : `Found ${stationCount} stations in/near the city`,
      });

      return;
    }

    // Use faster animation for better responsiveness
    map.current.flyTo({
      center: [city.longitude, city.latitude],
      zoom: zoomLevel,
      essential: true,
      duration: 800, // Reduced from 1500 for faster response
      easing: (t) => t // Linear easing for faster movement
    });

    // Force map update and ensure markers are displayed correctly
    map.current.once('moveend', () => {
      if (map.current) {
        console.log(`Map movement completed to: ${cityName}`);

        // Trigger immediate repaint to show markers faster
        window.requestAnimationFrame(() => {
          map.current?.triggerRepaint();
        });
      }
    });

    // Show toast notification
    toast({
      title: language === 'ar' ? `${city?.name}` : `${city?.nameEn}`,
      description: language === 'ar'
        ? `تم العثور على ${stationCount} محطة في/بالقرب من المدينة`
        : `Found ${stationCount} stations in/near the city`,
    });
  }, [cities, map, language, toast, detectLowPerformanceDevice]);

  // Filter stations by city name with optimized performance
  const filterStationsByCity = useCallback(async (cityName: string) => {
    try {
      if (!cityName || cityName === '') {
        // If no city is selected, return empty list to avoid showing all stations at once
        setFilteredStations([]);
        return;
      }

      setIsLoadingCity(true);

      // Move map to city immediately for better perceived performance
      const city = cities.find(c => c.name === cityName || c.nameEn === cityName);
      if (!city) {
        throw new Error(`City ${cityName} not found`);
      }

      // Start moving the map immediately while we load the stations
      // This gives the user immediate visual feedback
      if (map.current) {
        map.current.flyTo({
          center: [city.longitude, city.latitude],
          zoom: city.zoom || 11,
          essential: true,
          duration: 1000
        });
      }

      // Check cache first for better performance
      if (cityStationsCache[cityName]) {
        // Use cached results immediately
        setFilteredStations(cityStationsCache[cityName]);
        // Just update the map with station count
        moveMapToCity(cityName, cityStationsCache[cityName].length);
        setIsLoadingCity(false);
        return;
      }

      // Pre-allocate memory for results to avoid garbage collection
      const cityStationsResult: GasStation[] = [];
      const stationsWithDistance: (GasStation & { distanceFromCity?: number })[] = [];

      // Use a more efficient approach with Web Workers if available
      // For browsers that don't support it, fall back to optimized main thread processing
      const processStations = () => {
        // Find all stations in the selected city - use indexed lookup for better performance
        for (let i = 0; i < stations.length; i++) {
          const station = stations[i];
          if (station.region === city.name || station.region === city.nameEn) {
            cityStationsResult.push(station);
          }
        }

        // If we found exact matches, use them
        if (cityStationsResult.length > 0) {
          // Update cache
          setCityStationsCache(prev => ({ ...prev, [cityName]: cityStationsResult }));
          setFilteredStations(cityStationsResult);
          moveMapToCity(cityName, cityStationsResult.length);
          setIsLoadingCity(false);
          return;
        }

        // If no exact matches, use proximity search with optimized algorithm
        // Use spatial indexing approach for better performance
        const cityLat = city.latitude;
        const cityLng = city.longitude;

        // Pre-calculate constants for distance calculation
        const cosLat = Math.cos(cityLat * Math.PI / 180);
        const MAX_DISTANCE = 50; // km

        // Process all stations with optimized distance calculation
        for (let i = 0; i < stations.length; i++) {
          const station = stations[i];

          // Quick filter using bounding box (much faster than full distance calculation)
          // 1 degree of latitude is approximately 111km
          // 1 degree of longitude varies with latitude
          const latDiff = Math.abs(station.latitude - cityLat);
          if (latDiff > (MAX_DISTANCE / 111)) continue;

          const lngDiff = Math.abs(station.longitude - cityLng);
          if (lngDiff > (MAX_DISTANCE / (111 * cosLat))) continue;

          // Now do the more expensive precise calculation
          const distance = calculateDistance(
            station.latitude,
            station.longitude,
            cityLat,
            cityLng
          );

          if (distance <= MAX_DISTANCE) {
            stationsWithDistance.push({ ...station, distanceFromCity: distance });
          }
        }

        // Sort by distance and limit results
        stationsWithDistance.sort((a, b) => (a.distanceFromCity || 0) - (b.distanceFromCity || 0));

        // Take only the closest 500 stations for performance
        const nearbyStations = stationsWithDistance.slice(0, 500);

        // Update cache
        setCityStationsCache(prev => ({ ...prev, [cityName]: nearbyStations }));
        setFilteredStations(nearbyStations);
        moveMapToCity(cityName, nearbyStations.length);
        setIsLoadingCity(false);
      };

      // Use requestAnimationFrame for smoother UI
      // This gives the browser time to render the map movement first
      window.requestAnimationFrame(processStations);

    } catch (error) {
      console.error("Error filtering stations by city:", error);
      setFilteredStations([]);
      handleCityError(error);
      setIsLoadingCity(false);
    }
  }, [stations, cities, language, setFilteredStations, calculateDistance, cityStationsCache, moveMapToCity, handleCityError]);

  // Clear city filter cache
  const clearCityCache = useCallback(() => {
    setCityStationsCache({});
  }, []);

  return {
    filterStationsByCity,
    calculateDistance,
    isLoadingCity,
    clearCityCache
  };
};
