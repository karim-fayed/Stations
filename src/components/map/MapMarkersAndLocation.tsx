
import React from 'react';
import MapMarkerManager from './MapMarkerManager';
import UserLocationMarker from './UserLocationMarker';
import { GasStation } from '@/types/station';
import mapboxgl from 'mapbox-gl';

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
  return (
    <>
      <MapMarkerManager
        map={map}
        stations={filteredStations}
        selectedStation={selectedStation}
        onSelectStation={onSelectStation}
        language={language}
        createPopupContent={createPopupContent}
      />

      <UserLocationMarker
        map={map}
        userLocation={userLocation}
      />
    </>
  );
};

export default MapMarkersAndLocation;
