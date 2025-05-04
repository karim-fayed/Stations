
import { useCallback } from 'react';
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

  // Filter stations by city name
  const filterStationsByCity = useCallback((cityName: string) => {
    try {
      if (!cityName || cityName === '') {
        // If no city is selected, return empty list to avoid showing all stations at once
        setFilteredStations([]);
        return;
      }

      const city = cities.find(c => c.name === cityName || c.nameEn === cityName);
      
      if (!city) {
        throw new Error(`City ${cityName} not found`);
      }

      // Find all stations in the selected city
      const cityStations = stations.filter(station => {
        // Check if station's region matches the city name
        return station.region === city.name || station.region === city.nameEn;
      });

      // If no exact matches found, try by proximity
      if (cityStations.length === 0) {
        // Calculate distance to the city center for each station
        const stationsWithDistance = stations.map(station => {
          const distance = calculateDistance(
            station.latitude,
            station.longitude,
            city.latitude,
            city.longitude
          );
          return { ...station, distanceFromCity: distance };
        });

        // Get stations within 50km of the city center
        const nearbyStations = stationsWithDistance
          .filter(station => station.distanceFromCity <= 50)
          .sort((a, b) => (a.distanceFromCity || 0) - (b.distanceFromCity || 0));

        setFilteredStations(nearbyStations);
        toast({
          title: language === 'ar' ? `تم الانتقال إلى ${city.name}` : `Moved to ${city.nameEn}`,
          description: language === 'ar'
            ? `تم العثور على ${nearbyStations.length} محطة بالقرب من المدينة`
            : `Found ${nearbyStations.length} stations near the city`,
        });
      } else {
        setFilteredStations(cityStations);
        toast({
          title: language === 'ar' ? `تم الانتقال إلى ${city.name}` : `Moved to ${city.nameEn}`,
          description: language === 'ar'
            ? `تم العثور على ${cityStations.length} محطة في المدينة`
            : `Found ${cityStations.length} stations in the city`,
        });
      }

      // Move map to the selected city
      if (map.current && city) {
        map.current.flyTo({
          center: [city.longitude, city.latitude],
          zoom: city.zoom,
          essential: true,
          duration: 1500
        });
      }
    } catch (error) {
      console.error("Error filtering stations by city:", error);
      setFilteredStations([]);
      toast({
        title: language === 'ar' ? 'خطأ في تصفية المحطات' : 'Error filtering stations',
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    }
  }, [stations, cities, language, map, setFilteredStations, calculateDistance, toast]);

  return { filterStationsByCity, calculateDistance };
};
