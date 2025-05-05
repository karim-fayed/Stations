
import React, { useState, useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GasStation } from '@/types/station';
import { useToast } from "@/hooks/use-toast";

// Import custom hooks
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapLocation } from '@/hooks/useMapLocation';
import { useMapSearch } from '@/hooks/useMapSearch';
import { useCityFilter } from '@/hooks/useCityFilter';
import { useMapLocalization } from './map/useMapLocalization';
import { useSaudiCities } from './map/useSaudiCities';

// Import modular components
import TopControls from './map/TopControls';
import MapContainer from './map/MapContainer';
import StationPopup from './map/StationPopup';
import MapControls from './map/MapControls';
import MapOverlays from './map/MapOverlays';
import MapAnimation from './map/MapAnimation';
import MapMarkersAndLocation from './map/MapMarkersAndLocation';

// Import utils
import { createPopupContent, resetMap } from '@/utils/mapUtils';

interface InteractiveMapProps {
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
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
  const { mapContainer, map, mapLoaded } = useMapInitialization(language);

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
    // Only start background tracking if map is loaded and initBackgroundLocation is true
    if (initBackgroundLocation && map.current && mapLoaded) {
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
  }, [initBackgroundLocation, map.current, mapLoaded, startBackgroundLocationTracking, stopBackgroundLocationTracking, onLocationInitialized]);

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
      {/* Search and City Selection */}
      <TopControls
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

      {/* Map Container */}
      <MapContainer 
        mapContainerRef={mapContainer}
        onResetMap={handleResetMap}
        language={language}
      >
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
      </MapContainer>

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

      {/* Hidden marker management components - Only render when map is loaded */}
      {map.current && mapLoaded && (
        <MapMarkersAndLocation
          map={map.current}
          filteredStations={filteredStations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
          language={language}
          userLocation={userLocation}
          createPopupContent={handleCreatePopupContent}
        />
      )}

      <MapAnimation enable={true} />
    </div>
  );
};

export default InteractiveMap;
