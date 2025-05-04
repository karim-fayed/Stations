
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';  // إضافة استيراد mapboxgl هنا
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
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Debounce search term with longer delay to reduce excessive searches
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // Increased from 300ms to 400ms for better performance

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Cache search results to improve performance
  const [searchCache, setSearchCache] = useState<{ [key: string]: GasStation[] }>({});

  // Update filtered stations when search term changes
  useEffect(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    
    if (!term) {
      return;
    }

    // Use cached results if available
    if (searchCache[term]) {
      setFilteredStations(searchCache[term]);
      navigateToResults(searchCache[term]);
      return;
    }

    setIsSearching(true);

    // Implement more efficient filtering with batch processing for large datasets
    // Use requestAnimationFrame to avoid UI blocking
    window.requestAnimationFrame(() => {
      const filtered = stations.filter(station =>
        station.name.toLowerCase().includes(term) ||
        (station.region?.toLowerCase() || '').includes(term) ||
        (station.sub_region?.toLowerCase() || '').includes(term) ||
        (station.fuel_types?.toLowerCase() || '').includes(term)
      );

      // Cache results for future use
      setSearchCache(prev => ({ ...prev, [term]: filtered }));
      setFilteredStations(filtered);
      navigateToResults(filtered);
      setIsSearching(false);
    });
    
  }, [debouncedSearchTerm, stations, cities, onSelectStation, map]);

  // Helper function to navigate to search results
  const navigateToResults = (filtered: GasStation[]) => {
    if (filtered.length > 0 && map.current) {
      // Check for matching city first (more efficient city search)
      const term = debouncedSearchTerm.trim().toLowerCase();
      const matchingCity = cities.find(city =>
        city.name.toLowerCase().includes(term) ||
        city.nameEn.toLowerCase().includes(term)
      );

      if (matchingCity) {
        // If we found a matching city, navigate to it
        map.current.flyTo({
          center: [matchingCity.longitude, matchingCity.latitude],
          zoom: matchingCity.zoom,
          essential: true,
          duration: 1000
        });
      } else if (filtered.length > 0) {
        // Group nearby stations to prevent excessive zooming
        if (filtered.length > 5) {
          // Find center point of all stations for better viewport positioning
          const bounds = new mapboxgl.LngLatBounds();
          
          // Add first 20 stations max to bounds to avoid performance issues
          filtered.slice(0, 20).forEach(station => {
            bounds.extend([station.longitude, station.latitude]);
          });
          
          // Fit map to these bounds
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 14,
            duration: 1200
          });
        } else {
          // For fewer stations, go to the first one
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
    }
  };

  // Clear search and reset
  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    filteredStations,
    setFilteredStations,
    isSearching,
    clearSearch
  };
};
