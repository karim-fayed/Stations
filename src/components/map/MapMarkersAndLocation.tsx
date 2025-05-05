
import React, { useState, useEffect } from 'react';
import MapMarkerManager from './MapMarkerManager';
import ClusteredMarkers from './ClusteredMarkers';
import UserLocationMarker from './UserLocationMarker';
import { GasStation } from '@/types/station';
import mapboxgl from 'mapbox-gl';
import './cluster-styles.css';

interface MapMarkersAndLocationProps {
  map: mapboxgl.Map;
  filteredStations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
  userLocation: { latitude: number; longitude: number } | null;
  createPopupContent: (station: GasStation) => HTMLElement;
}

const MapMarkersAndLocation: React.FC<MapMarkersAndLocationProps> = ({
  map,
  filteredStations,
  selectedStation,
  onSelectStation,
  language,
  userLocation,
  createPopupContent
}) => {
  // Determine whether to use clustering based on station count
  const [useClustering, setUseClustering] = useState(false);

  // Enable clustering when there are many stations
  useEffect(() => {
    // Use clustering when there are more than 20 stations for better performance
    setUseClustering(filteredStations.length > 20);
  }, [filteredStations.length]);

  return (
    <>
      {/* Use either clustered markers or regular markers based on station count */}
      {useClustering ? (
        <ClusteredMarkers
          map={map}
          stations={filteredStations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
          language={language}
        />
      ) : (
        <MapMarkerManager
          map={map}
          stations={filteredStations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
          language={language}
          createPopupContent={createPopupContent}
        />
      )}

      <UserLocationMarker
        map={map}
        userLocation={userLocation}
      />
    </>
  );
};

export default MapMarkersAndLocation;
