
import { useState, useEffect } from 'react';
import { GasStation, SaudiCity } from '@/types/station';
import { useToast } from "@/hooks/use-toast";

export const useMapSearch = (
  stations: GasStation[],
  cities: SaudiCity[],
  onSelectStation: (station: GasStation | null) => void,
  map: React.MutableRefObject<mapboxgl.Map | null>,
  language: 'ar' | 'en'
) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [filteredStations, setFilteredStations] = useState<GasStation[]>([]);
  const { toast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Update filtered stations when search term changes
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      return;
    }

    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      station.region?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      station.sub_region?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (station.fuel_types && station.fuel_types.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );

    setFilteredStations(filtered);

    // Navigate to station or city on search
    if (filtered.length > 0 && map.current) {
      // Check for matching city first
      const matchingCity = cities.find(city =>
        city.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        city.nameEn.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );

      if (matchingCity) {
        // If we found a matching city, navigate to it
        map.current.flyTo({
          center: [matchingCity.longitude, matchingCity.latitude],
          zoom: matchingCity.zoom,
          essential: true,
          duration: 1000
        });
      } else {
        // If no matching city, navigate to first station in results
        const firstStation = filtered[0];
        map.current.flyTo({
          center: [firstStation.longitude, firstStation.latitude],
          zoom: 14,
          essential: true,
          duration: 1000
        });

        // Select the station
        onSelectStation(firstStation);
      }
    }
  }, [debouncedSearchTerm, stations, cities, onSelectStation, map]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredStations,
    setFilteredStations
  };
};
