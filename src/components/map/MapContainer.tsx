
import React, { useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from "lucide-react";

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  onResetMap: () => void;
  language: 'ar' | 'en';
  children?: React.ReactNode;
}

const MapContainer: React.FC<MapContainerProps> = ({
  mapContainerRef,
  onResetMap,
  language,
  children
}) => {
  return (
    <div className="relative flex-grow">
      <div ref={mapContainerRef} className="map-container h-[500px] rounded-lg shadow-lg"></div>

      {/* Reset map button */}
      <div className="absolute top-2 left-2 z-10">
        <Button
          variant="outline" 
          size="icon"
          className="bg-white hover:bg-gray-100 shadow-md"
          onClick={onResetMap}
          title={language === 'ar' ? 'إعادة تعيين الخريطة' : 'Reset map'}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {children}
    </div>
  );
};

export default MapContainer;
