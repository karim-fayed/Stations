
import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';
import { useMarkerManager } from '@/hooks/useMarkerManager';
import MarkerAnimationStyles from './MarkerAnimationStyles';

interface MapMarkerManagerProps {
  map: mapboxgl.Map | null;
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
  createPopupContent: (station: GasStation) => HTMLElement;
}

const MapMarkerManager: React.FC<MapMarkerManagerProps> = ({
  map,
  stations,
  selectedStation,
  onSelectStation,
  language,
  createPopupContent
}) => {
  // Use the marker manager hook
  const { updateMarkers } = useMarkerManager({
    map, 
    stations, 
    selectedStation, 
    onSelectStation,
    language,
    createPopupContent
  });

  // Update markers when stations or selected station changes
  useEffect(() => {
    updateMarkers();
  }, [stations, selectedStation, updateMarkers]);

  return (
    <>
      {/* Component for marker animations and styles */}
      <MarkerAnimationStyles />
    </>
  );
};

export default MapMarkerManager;
