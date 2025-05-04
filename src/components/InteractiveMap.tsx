
import React, { useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GasStation } from '@/types/station';
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw } from "lucide-react";

// Import custom hooks
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapLocation } from '@/hooks/useMapLocation';
import { useMapSearch } from '@/hooks/useMapSearch';
import { useCityFilter } from '@/hooks/useCityFilter';
import { useMapLocalization } from './map/useMapLocalization';
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
import MapboxTokenInput from './map/MapboxTokenInput';
import { Button } from '@/components/ui/button';

// Import utils
import { createPopupContent, resetMap } from '@/utils/mapUtils';

interface InteractiveMapProps {
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
  stations: GasStation[];
  initBackgroundLocation?: boolean;
  onLocationInitialized?: () => void;
  onMapLoadError?: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedStation,
  onSelectStation,
  language,
  stations,
  initBackgroundLocation = false,
  onLocationInitialized,
  onMapLoadError
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { toast } = useToast();
  const [mapInitError, setMapInitError] = useState<boolean>(false);

  // Load localization and cities data
  const texts = useMapLocalization(language);
  const { cities } = useSaudiCities();

  // Initialize map with error handling
  const { mapContainer, map, tokenError, refreshWithNewToken, mapInitialized } = useMapInitialization(language);

  // Handle token update
  const handleTokenSaved = () => {
    refreshWithNewToken();
  };

  // Check for map initialization errors
  useEffect(() => {
    const checkMapInitialization = setTimeout(() => {
      if (!map.current && mapContainer.current && !tokenError) {
        console.error("Map failed to initialize");
        setMapInitError(true);
        if (onMapLoadError) onMapLoadError();
      }
    }, 5000); // Give it 5 seconds to initialize

    return () => clearTimeout(checkMapInitialization);
  }, [map, onMapLoadError, tokenError]);

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

  // Start background location tracking when map is loaded
  useEffect(() => {
    if (initBackgroundLocation && map.current && mapInitialized) {
      console.log("Starting background location tracking");
      startBackgroundLocationTracking();
      
      // Notify parent component that location tracking has started
      if (onLocationInitialized) {
        onLocationInitialized();
      }
    }
    
    return () => {
      // Stop background location tracking when component is unmounted
      stopBackgroundLocationTracking();
    };
  }, [initBackgroundLocation, map.current, mapInitialized, startBackgroundLocationTracking, stopBackgroundLocationTracking, onLocationInitialized]);

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

  // Show token input if token error
  if (tokenError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <MapboxTokenInput language={language} onTokenSaved={handleTokenSaved} />
      </div>
    );
  }

  if (mapInitError) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="mb-4 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {language === 'ar' ? 'لم نتمكن من تحميل الخريطة' : 'Unable to load the map'}
        </h3>
        <p className="text-gray-600 mb-4">
          {language === 'ar' 
            ? 'هناك مشكلة في تحميل الخريطة. يرجى التحقق من اتصال الإنترنت الخاص بك أو المحاولة مرة أخرى لاحقًا.'
            : 'There was a problem loading the map. Please check your internet connection or try again later.'}
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-noor-purple hover:bg-purple-800"
        >
          {language === 'ar' ? 'إعادة تحميل الصفحة' : 'Reload page'}
        </Button>
      </div>
    );
  }

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
        <div ref={mapContainer} className="map-container h-[500px] rounded-lg shadow-lg"></div>

        {/* Reset map button */}
        <div className="absolute top-2 left-2 z-10">
          <Button
            variant="outline" 
            size="icon"
            className="bg-white hover:bg-gray-100 shadow-md"
            onClick={handleResetMap}
            title={language === 'ar' ? 'إعادة تعيين الخريطة' : 'Reset map'}
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
      {map.current && (
        <>
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
        </>
      )}

      <MapAnimation enable={true} />
    </div>
  );
};

export default InteractiveMap;
