
import React from 'react';
import { Language } from '@/i18n/translations';

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

const MapContainer: React.FC<MapContainerProps> = ({ mapContainerRef }) => {
  return (
    <div 
      ref={mapContainerRef} 
      className="map-container h-[50vh] md:h-[55vh] lg:h-[45vh] xl:h-[50vh] rounded-lg shadow-lg"
    />
  );
};

export default MapContainer;
