
import React, { useState, useCallback, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GasStation } from '@/types/station';
import { useToast } from "@/hooks/use-toast";
import { Language } from '@/i18n/translations';
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import custom hooks
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapLocation } from '@/hooks/useMapLocation';
import { useMapSearch } from '@/hooks/useMapSearch';
import { useCityFilter } from '@/hooks/useCityFilter';
import { useMapLocalization } from '@/components/map/useMapLocalization';
import { useSaudiCities } from './map/useSaudiCities';

// Import modular components
import SearchFilterSection from './map/SearchFilterSection';
import MapContainer from './map/MapContainer';
import MapControlPanel from './map/MapControlPanel';
import MapOverlays from './map/MapOverlays';
import StationPopup from './map/StationPopup';
import MapMarkerManager from './map/MapMarkerManager';
import UserLocationMarker from './map/UserLocationMarker';

// Import utils
import { createPopupContent, resetMap } from '@/utils/mapUtils';

interface InteractiveMapProps {
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: Language;
  stations: GasStation[];
  initBackgroundLocation?: boolean;
  onLocationInitialized?: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedStation,
  onSelectStation,
  language,
  stations,
  initBackgroundLocation = false,
  onLocationInitialized
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { toast } = useToast();
  const [locationInitialized, setLocationInitialized] = useState(false);
  const isRTL = language === 'ar';

  // Load localization and cities data
  const texts = useMapLocalization(language);
  const { cities } = useSaudiCities();

  // Initialize map
  const { mapContainer, map } = useMapInitialization(language);

  // Setup search functionality
  const { 
    searchTerm, 
    setSearchTerm, 
    debouncedSearchTerm, 
    setDebouncedSearchTerm,
    filteredStations, 
    setFilteredStations,
    isSearching,
    clearSearch
  } = useMapSearch(stations, cities, onSelectStation, map, language);

  // Setup city filtering
  const { filterStationsByCity, isLoadingCity, clearCityCache } = useCityFilter(
    stations, 
    cities, 
    language, 
    map, 
    setFilteredStations
  );

  // Setup user location and navigation
  const { 
    userLocation,
    setUserLocation,
    isLoadingLocation, 
    isLoadingNearest, 
    getUserLocation, 
    findNearestStation, 
    showDirections,
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking
  } = useMapLocation(map, onSelectStation, texts, language);

  // Initialize background location tracking with better parameters
  const initializeBackgroundLocation = useCallback(() => {
    if (initBackgroundLocation && map.current && !locationInitialized) {
      console.log("Starting background location tracking with optimization");
      // Start with higher accuracy requirement (500m) and longer interval (5 minutes)
      startBackgroundLocationTracking(500, 300000);
      setLocationInitialized(true);
      
      // Notify parent component that location tracking has started
      if (onLocationInitialized) {
        onLocationInitialized();
      }
    }
  }, [initBackgroundLocation, map, locationInitialized, startBackgroundLocationTracking, onLocationInitialized]);

  useEffect(() => {
    // Slight delay to ensure map is fully initialized
    if (map.current && initBackgroundLocation && !locationInitialized) {
      const timer = setTimeout(() => {
        initializeBackgroundLocation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      // Stop tracking when component is unmounted
      if (locationInitialized) {
        stopBackgroundLocationTracking();
      }
    };
  }, [map.current, initBackgroundLocation, locationInitialized, initializeBackgroundLocation, stopBackgroundLocationTracking]);

  // Create popup content handler
  const handleCreatePopupContent = (station: GasStation) => {
    return createPopupContent(station, texts, language, onSelectStation);
  };

  // Handle city change
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    filterStationsByCity(cityName);
  };

  // Handle map reset
  const handleResetMap = () => {
    resetMap(
      map.current, 
      onSelectStation, 
      setSearchTerm, 
      setDebouncedSearchTerm,
      setUserLocation, 
      setSelectedCity, 
      setFilteredStations,
      language,
      toast
    );
    
    // Clear search and caches for better performance
    clearSearch();
    clearCityCache();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search and Filter Section */}
      <SearchFilterSection 
        cities={cities}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        filteredStations={filteredStations}
        texts={texts}
        language={language}
        isSearching={isSearching}
      />

      <div className="relative flex-grow">
        {/* Map Container */}
        <MapContainer mapContainerRef={mapContainer} />

        {/* Reset map button */}
        <MapControlPanel 
          onResetMap={handleResetMap}
          language={language}
        />

        {/* Map Overlay Components */}
        <MapOverlays
          isLoadingLocation={isLoadingLocation}
          isLoadingNearest={isLoadingNearest}
          isLoadingCity={isLoadingCity}
          selectedCity={selectedCity}
          filteredStations={filteredStations}
          language={language}
        />

        {/* Station Popup Component - Only show when a station is selected */}
        {selectedStation && (
          <StationPopup
            station={selectedStation}
            onSelectStation={onSelectStation}
            language={language}
            texts={texts}
            onShowDirections={() => showDirections(selectedStation)}
            onReset={handleResetMap}
          />
        )}

        {/* Hidden marker management components */}
        <MapMarkerManager
          map={map.current}
          stations={filteredStations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
          language={language}
          createPopupContent={handleCreatePopupContent}
        />

        <UserLocationMarker
          map={map.current}
          userLocation={userLocation}
        />
      </div>

      {/* Map Controls */}
      <div className="bg-white border-t p-3 flex justify-between gap-2">
        <Button 
          className="flex-1 bg-noor-purple text-white hover:bg-noor-purple/90"
          onClick={getUserLocation}
          disabled={isLoadingLocation}
        >
          <MapPin className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isLoadingLocation 
            ? (isRTL ? 'جاري التحميل...' : 'Loading...') 
            : texts.getLocation}
        </Button>
        
        <Button 
          variant="outline"
          className={`flex-1 border-noor-orange text-noor-orange ${!userLocation ? 'opacity-50' : 'hover:bg-orange-50'}`}
          onClick={() => findNearestStation()}
          disabled={isLoadingNearest || !userLocation}
        >
          <Navigation className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isLoadingNearest 
            ? (isRTL ? 'جاري البحث...' : 'Searching...') 
            : texts.findNearest}
        </Button>
      </div>
    </div>
  );
};

export default InteractiveMap;
