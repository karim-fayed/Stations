
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
        willChange: 'transform', // Improves rendering performance
        backfaceVisibility: 'hidden', // Helps with GPU acceleration
        WebkitBackfaceVisibility: 'hidden',
        WebkitPerspective: '1000',
        perspective: '1000',
        transform: 'translate3d(0,0,0)',
        WebkitTransform: 'translate3d(0,0,0)'
      }}
    />
  );
};

export default MapContainer;
