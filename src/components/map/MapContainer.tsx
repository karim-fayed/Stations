
import React from 'react';

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

const MapContainer: React.FC<MapContainerProps> = ({ mapContainerRef }) => {
  return (
    <div 
      ref={mapContainerRef} 
      className="map-container h-full w-full rounded-none"
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform' // Improves rendering performance
      }}
    />
  );
};

export default MapContainer;
