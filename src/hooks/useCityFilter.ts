
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

  // Filter stations by city name with performance improvements
  const filterStationsByCity = useCallback(async (cityName: string) => {
    try {
      if (!cityName || cityName === '') {
        // If no city is selected, return empty list to avoid showing all stations at once
        setFilteredStations([]);
        return;
      }

      setIsLoadingCity(true);

      // Check cache first for better performance
      if (cityStationsCache[cityName]) {
        setFilteredStations(cityStationsCache[cityName]);
        moveMapToCity(cityName, cityStationsCache[cityName].length);
        setIsLoadingCity(false);
        return;
      }

      const city = cities.find(c => c.name === cityName || c.nameEn === cityName);
      
      if (!city) {
        throw new Error(`City ${cityName} not found`);
      }

      // Use requestAnimationFrame to avoid UI blocking during filtering
      window.requestAnimationFrame(() => {
        try {
          // Find all stations in the selected city
          const cityStations = stations.filter(station => {
            // Check if station's region matches the city name
            return station.region === city.name || station.region === city.nameEn;
          });
    
          // If no exact matches found, try by proximity
          if (cityStations.length === 0) {
            // Calculate distance to the city center for each station (using a more efficient algorithm)
            // Process in batches to avoid blocking UI
            const MAX_BATCH_SIZE = 200;
            const stationsWithDistance: (GasStation & { distanceFromCity?: number })[] = [];
            
            // Process stations in batches
            for (let i = 0; i < stations.length; i += MAX_BATCH_SIZE) {
              const batch = stations.slice(i, i + MAX_BATCH_SIZE);
              
              batch.forEach(station => {
                const distance = calculateDistance(
                  station.latitude,
                  station.longitude,
                  city.latitude,
                  city.longitude
                );
                if (distance <= 50) { // Only process stations within 50km
                  stationsWithDistance.push({ ...station, distanceFromCity: distance });
                }
              });
            }
    
            // Sort by distance and limit to 500 stations for performance
            const nearbyStations = stationsWithDistance
              .sort((a, b) => (a.distanceFromCity || 0) - (b.distanceFromCity || 0))
              .slice(0, 500);
    
            // Update cache
            setCityStationsCache(prev => ({ ...prev, [cityName]: nearbyStations }));
            setFilteredStations(nearbyStations);
            moveMapToCity(cityName, nearbyStations.length);
          } else {
            // Update cache
            setCityStationsCache(prev => ({ ...prev, [cityName]: cityStations }));
            setFilteredStations(cityStations);
            moveMapToCity(cityName, cityStations.length);
          }
        } catch (innerError) {
          console.error("Error in filtering animation frame:", innerError);
          setFilteredStations([]);
          handleCityError(innerError);
        } finally {
          setIsLoadingCity(false);
        }
      });

    } catch (error) {
      console.error("Error filtering stations by city:", error);
      setFilteredStations([]);
      handleCityError(error);
      setIsLoadingCity(false);
    }
  }, [stations, cities, language, setFilteredStations, calculateDistance, cityStationsCache]);

  // Enhanced function to move map to city with better zoom handling
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
    
    // Adjust zoom level based on station count
    if (stationCount > 100) {
      zoomLevel -= 0.5; // Zoom out a bit for many stations
    } else if (stationCount < 10) {
      zoomLevel += 0.5; // Zoom in a bit for few stations
    }
    
    // Apply performance adjustments if needed
    if (detectLowPerformanceDevice()) {
      zoomLevel = Math.max(zoomLevel - 1, 8);
    }
    
    // Ensure the map is centered with proper animation
    map.current.flyTo({
      center: [city.longitude, city.latitude],
      zoom: zoomLevel,
      essential: true,
      duration: 1500,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // Smooth easing function
    });
    
    // Force map update and ensure markers are displayed correctly
    map.current.once('moveend', () => {
      if (map.current) {
        console.log(`Map movement completed to: ${cityName}`);
        map.current.triggerRepaint();
      }
    });

    // Show toast notification
    toast({
      title: language === 'ar' ? `تم الانتقال إلى ${city?.name}` : `Moved to ${city?.nameEn}`,
      description: language === 'ar'
        ? `تم العثور على ${stationCount} محطة في/بالقرب من المدينة`
        : `Found ${stationCount} stations in/near the city`,
    });
  }, [cities, map, language, toast]);

  // Helper to handle city filter errors
  const handleCityError = useCallback((error: any) => {
    toast({
      title: language === 'ar' ? 'خطأ في تصفية المحطات' : 'Error filtering stations',
      description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
      variant: "destructive",
    });
  }, [language, toast]);

  // Detect if device is likely low performance
  const detectLowPerformanceDevice = useCallback(() => {
    // Check for various indicators of low-performance devices
    const isSlowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return isSlowCPU || isMobile;
  }, []);

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
