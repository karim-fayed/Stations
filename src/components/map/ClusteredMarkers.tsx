import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';
import { useMarkerClustering } from '@/hooks/useMarkerClustering';
import './cluster-styles.css';

interface ClusteredMarkersProps {
  map: mapboxgl.Map;
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
}

const ClusteredMarkers: React.FC<ClusteredMarkersProps> = ({
  map,
  stations,
  selectedStation,
  onSelectStation,
  language
}) => {
  // Use the marker clustering hook
  const { visibleMarkers } = useMarkerClustering({
    map,
    stations,
    selectedStation,
    onSelectStation,
    language
  });

  return (
    <>
      {/* This component doesn't render anything directly,
          it just manages the markers on the map */}
      {/* استخدام style بدون خاصية jsx لتجنب التحذير */}
      <style>{`
        /* Cluster marker animations */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .cluster-marker {
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default ClusteredMarkers;
