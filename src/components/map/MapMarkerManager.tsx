
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

  // Check if map is loaded before updating markers
  const [mapLoaded, setMapLoaded] = React.useState(false);

  useEffect(() => {
    if (!map) return;
    
    if (map.loaded()) {
      setMapLoaded(true);
    } else {
      const onLoadHandler = () => {
        console.log("Map loaded in MapMarkerManager");
        setMapLoaded(true);
      };
      
      map.on('load', onLoadHandler);
      return () => {
        map.off('load', onLoadHandler);
      };
    }
  }, [map]);

  // Update markers when stations or selected station changes
  useEffect(() => {
    if (mapLoaded) {
      updateMarkers();
    }
  }, [stations, selectedStation, mapLoaded, updateMarkers]);

  return (
    <>
      {/* Component for marker animations and styles */}
      <MarkerAnimationStyles />
    </>
  );
};

export default MapMarkerManager;
