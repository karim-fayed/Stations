
import React from 'react';
import { Language } from '@/i18n/translations';

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

const MapContainer: React.FC<MapContainerProps> = ({ mapContainerRef }) => {
  return (
    <div 
      ref={mapContainerRef} 
      className="map-container h-full w-full rounded-none"
    />
  );
};

export default MapContainer;
