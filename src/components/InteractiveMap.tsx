
import React, { useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GasStation } from '@/types/station';
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw } from "lucide-react";
import { Language } from '@/i18n/translations';

// Import custom hooks
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapLocation } from '@/hooks/useMapLocation';
import { useMapSearch } from '@/hooks/useMapSearch';
import { useCityFilter } from '@/hooks/useCityFilter';
import { useMapLocalization } from '@/components/map/useMapLocalization';
import { useSaudiCities } from './map/useSaudiCities';

// Import modular components
import CitySelector from './map/CitySelector';
import MapControls from './map/MapControls';
import StationPopup from './map/StationPopup';
import MapMarkerManager from './map/MapMarkerManager';
import UserLocationMarker from './map/UserLocationMarker';
import MapAnimation from './map/MapAnimation';
import MapSearchBar from './map/MapSearchBar';
import MapOverlays from './map/MapOverlays';
import { Button } from '@/components/ui/button';

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

  // بدء تحديد الموقع في الخلفية عند تحميل الخريطة
  useEffect(() => {
    if (initBackgroundLocation && map.current) {
      console.log("Starting background location tracking");
      startBackgroundLocationTracking();
      
      // إخطار المكون الأب أننا بدأنا تحديد الموقع
      if (onLocationInitialized) {
        onLocationInitialized();
      }
    }
    
    return () => {
      // إيقاف تحديد الموقع عند إزالة المكون
      stopBackgroundLocationTracking();
    };
  }, [initBackgroundLocation, map.current]);

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
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        {/* City Selector Component */}
        <div className="flex-1">
          <CitySelector
            cities={cities}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
            language={language}
          />
        </div>

        {/* Search Field */}
        <MapSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          debouncedSearchTerm={debouncedSearchTerm}
          filteredStations={filteredStations}
          texts={texts}
          language={language}
          isSearching={isSearching}
        />
      </div>

      <div className="relative flex-grow">
        <div ref={mapContainer} className="map-container h-[70vh] rounded-lg shadow-lg"></div>

        {/* Reset map button */}
        <div className="absolute top-2 left-2 z-10">
          <Button
            variant="outline" 
            size="icon"
            className="bg-white hover:bg-gray-100 shadow-md"
            onClick={handleResetMap}
            title={language === Language.ARABIC ? 'إعادة تعيين الخريطة' : 'Reset map'}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

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
      </div>

      {/* Map Controls Component */}
      <MapControls
        onGetLocation={getUserLocation}
        onFindNearest={() => findNearestStation()}
        isLoadingLocation={isLoadingLocation}
        isLoadingNearest={isLoadingNearest}
        hasUserLocation={!!userLocation}
        texts={texts}
        language={language}
      />

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

      <MapAnimation enable={true} />
    </div>
  );
};

export default InteractiveMap;
