import { useState, useEffect } from 'react';
import { GasStation } from '@/types/station';
import { SaudiCity } from '@/components/map/types';
import { useToast } from '@/hooks/use-toast';
import { Language } from '@/i18n/translations';

export const useMapSearch = (
  stations: GasStation[],
  cities: SaudiCity[],
  onSelectStation: (station: GasStation | null) => void,
  map: React.MutableRefObject<mapboxgl.Map | null>,
  language: Language
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filteredStations, setFilteredStations] = useState<GasStation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Filter stations based on search term
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredStations([]);
      return;
    }

    setIsSearching(true);
    
    // Search in station names, regions, and sub-regions
    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      station.region.toLowerCase().includes(lowerCaseSearchTerm) ||
      station.sub_region.toLowerCase().includes(lowerCaseSearchTerm)
    );
    
    setFilteredStations(filtered);
    
    // If there's exactly one result and it's a close match, auto-select it
    if (filtered.length === 1 && 
        (filtered[0].name.toLowerCase() === lowerCaseSearchTerm ||
         filtered[0].sub_region.toLowerCase() === lowerCaseSearchTerm)) {
      onSelectStation(filtered[0]);
      
      // Fly to the station
      if (map.current && filtered[0].latitude && filtered[0].longitude) {
        map.current.flyTo({
          center: [filtered[0].longitude, filtered[0].latitude],
          zoom: 15,
          duration: 1000
        });
      }
    } 
    // If there are results, focus the map on those areas
    else if (filtered.length > 0) {
      // Try to find a city that matches the search term first
      const matchingCity = cities.find(city => 
        (language === Language.ARABIC ? city.name : city.nameEn).toLowerCase().includes(lowerCaseSearchTerm)
      );
      
      if (matchingCity && map.current) {
        map.current.flyTo({
          center: [matchingCity.longitude, matchingCity.latitude],
          zoom: matchingCity.zoom || 12,
          duration: 1000
        });
      }
      // Otherwise, if we have results but no matching city, fit bounds to include all results
      else if (filtered.length > 0 && map.current) {
        // Calculate bounds to fit all filtered stations
        const bounds = new mapboxgl.LngLatBounds();
        
        filtered.forEach(station => {
          if (station.latitude && station.longitude) {
            bounds.extend([station.longitude, station.latitude]);
          }
        });
        
        // Check if bounds are valid (non-empty)
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, {
            padding: 100,
            duration: 1000
          });
        }
      }

      // Show notification for search results
      if (filtered.length > 0) {
        toast({
          title: language === Language.ARABIC ? 'نتائج البحث' : 'Search Results',
          description: language === Language.ARABIC
            ? `تم العثور على ${filtered.length} محطة`
            : `Found ${filtered.length} stations`,
        });
      }
    } 
    // If no results, show a notification
    else {
      toast({
        title: language === Language.ARABIC ? 'لا توجد نتائج' : 'No Results',
        description: language === Language.ARABIC 
          ? 'لم يتم العثور على محطات مطابقة' 
          : 'No matching stations found',
        variant: 'destructive',
      });
    }

    setIsSearching(false);
  }, [debouncedSearchTerm, stations, cities, onSelectStation, map, language, toast]);

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilteredStations([]);
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
