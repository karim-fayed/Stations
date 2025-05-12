
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GasStation } from '@/types/station';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/i18n/LanguageContext';

// Import custom hooks
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapLocation } from '@/hooks/useMapLocation';
import { useMapSearch } from '@/hooks/useMapSearch';
import { useCityFilter } from '@/hooks/useCityFilter';
import { useMapLocalization } from './map/useMapLocalization';
import { useSaudiCities } from './map/useSaudiCities';

// Import essential components immediately
import TopControls from './map/TopControls';
import MapContainer from './map/MapContainer';
import MapOverlays from './map/MapOverlays';

// Lazy load non-essential components for better performance
const StationPopup = lazy(() => import('./map/StationPopup'));
const MapControls = lazy(() => import('./map/MapControls'));
const MapAnimation = lazy(() => import('./map/MapAnimation'));
const MapMarkersAndLocation = lazy(() => import('./map/MapMarkersAndLocation'));

// Import utils
import { createPopupContent, resetMap } from '@/utils/mapUtils';

interface InteractiveMapProps {
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language?: 'ar' | 'en'; // Hacemos el parámetro opcional
  stations: GasStation[];
  initBackgroundLocation?: boolean;
  onLocationInitialized?: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedStation,
  onSelectStation,
  language: propLanguage,
  stations,
  initBackgroundLocation = false,
  onLocationInitialized
}) => {
  // Usamos el contexto de idioma
  const { language: contextLanguage } = useLanguage();

  // Usamos el idioma proporcionado como prop o el del contexto
  const language = propLanguage || contextLanguage;
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { toast } = useToast();

  // Load localization and cities data
  const texts = useMapLocalization(language);
  const { cities, refreshCities } = useSaudiCities();

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

  // Track if map is ready for markers
  const [mapReadyForMarkers, setMapReadyForMarkers] = useState(false);

  // Progressively load map features
  useEffect(() => {
    if (map.current && mapLoaded) {
      // Delay marker loading slightly to prioritize map rendering
      const timer = setTimeout(() => {
        setMapReadyForMarkers(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [map.current, mapLoaded]);

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-noor-purple"></div>
    </div>
  );

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
        refreshCities={refreshCities}
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
          <div className="map-ui-overlay">
            <Suspense fallback={<LoadingFallback />}>
              <StationPopup
                station={selectedStation}
                onSelectStation={onSelectStation}
                language={language}
                texts={texts}
                onShowDirections={() => showDirections(selectedStation)}
                onReset={handleResetMap}
                userLocation={userLocation}
              />
            </Suspense>
          </div>
        )}
      </MapContainer>

      {/* Map Controls Component - Lazy loaded */}
      <Suspense fallback={<LoadingFallback />}>
        <MapControls
          onGetLocation={getUserLocation}
          onFindNearest={() => findNearestStation()}
          isLoadingLocation={isLoadingLocation}
          isLoadingNearest={isLoadingNearest}
          hasUserLocation={!!userLocation}
          texts={texts}
          language={language}
        />
      </Suspense>

      {/* Hidden marker management components - Only render when map is fully loaded and ready */}
      {map.current && mapLoaded && mapReadyForMarkers && (
        <Suspense fallback={null}>
          <MapMarkersAndLocation
            map={map.current}
            filteredStations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={onSelectStation}
            language={language}
            userLocation={userLocation}
            createPopupContent={handleCreatePopupContent}
          />
        </Suspense>
      )}

      {/* Animation component - Lazy loaded with low priority */}
      <Suspense fallback={null}>
        <MapAnimation enable={true} />
      </Suspense>
    </div>
  );
};

export default InteractiveMap;
