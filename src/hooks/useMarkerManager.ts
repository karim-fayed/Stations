import { useRef, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';
import { createMarkerElement, stylePopupCloseButton, handleMarkerHover } from '@/components/map/utils/markerUtils';

interface UseMarkerManagerProps {
  map: mapboxgl.Map | null;
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
  createPopupContent: (station: GasStation) => HTMLElement;
}

export const useMarkerManager = ({
  map,
  stations,
  selectedStation,
  onSelectStation,
  language,
  createPopupContent
}: UseMarkerManagerProps) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const activePopupRef = useRef<mapboxgl.Popup | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRenderedRef = useRef<{count: number, ids: string[]}>({count: 0, ids: []});
  
  // A memoized version of the stations data to reduce unnecessary updates
  const stationIds = useMemo(() => stations.map(s => s.id), [stations]);
  const selectedId = selectedStation?.id || null;

  // Optimized marker update function
  const updateMarkers = useCallback(() => {
    // If map isn't ready yet, don't do anything
    if (!map) return;

    // Check if we really need to update markers
    const stationsCount = stations.length;
    const idsMatch = stationsCount === lastRenderedRef.current.count && 
      stationIds.every(id => lastRenderedRef.current.ids.includes(id));
    
    // If we have the same stations (just in different order or with updated properties)
    // we only need to update the selected marker
    if (idsMatch && stationsCount > 0) {
      markersRef.current.forEach(marker => {
        const markerElement = marker.getElement();
        const stationId = markerElement.getAttribute('data-station-id');
        const isSelected = selectedId === stationId;
        
        // Only update the style of markers if selection has changed
        if (isSelected) {
          markerElement.style.width = '38px';
          markerElement.style.height = '38px';
          markerElement.style.filter = 'drop-shadow(0 0 8px rgba(255, 119, 51, 0.8))';
          markerElement.style.animation = 'bounce 1s infinite alternate';
          
          // Move selected marker above all others
          markerElement.style.zIndex = '100';
          
          // If selected, fly map to station
          if (selectedStation) {
            map.flyTo({
              center: [selectedStation.longitude, selectedStation.latitude],
              zoom: 14,
              essential: true,
              duration: 1000
            });
          }
        } else {
          // Reset styles for non-selected markers
          markerElement.style.width = '28px';
          markerElement.style.height = '28px';
          markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))';
          markerElement.style.animation = 'none';
          markerElement.style.zIndex = '1';
        }
      });
      
      return; // Skip full re-render of markers
    }

    // Otherwise, remove all existing markers and recreate them
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];

    // Cancel any active timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Performance optimization: limit markers to improve performance on low-end devices
    const MAX_MARKERS = 500;
    const markersToRender = stations.length > MAX_MARKERS ? stations.slice(0, MAX_MARKERS) : stations;

    // Create markers in batches of 100
    const createMarkerBatch = (startIdx: number, endIdx: number) => {
      const batch = markersToRender.slice(startIdx, endIdx);
      
      batch.forEach(station => {
        // Create marker for the station
        const el = createMarkerElement(station, selectedId);
        
        // Store the station ID in the element for easier reference
        el.setAttribute('data-station-id', station.id);
        
        // If selected, fly map to station
        if (selectedId === station.id && selectedStation) {
          map.flyTo({
            center: [selectedStation.longitude, selectedStation.latitude],
            zoom: 14,
            essential: true,
            duration: 1000
          });
        }

        // Create popup for the station with close button
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: 25,
          className: 'station-popup',
          maxWidth: '300px',
          anchor: 'bottom',
        }).setDOMContent(createPopupContent(station));
        
        // Style the close button
        stylePopupCloseButton(popup);
        
        popupsRef.current.push(popup);

        // Create marker and add to map
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom',
          offset: [0, -5] // Adjust offset to make the pin appear in the correct position
        })
          .setLngLat([station.longitude, station.latitude])
          .addTo(map);

        // Add marker to reference
        markersRef.current.push(marker);

        // Track popup display state
        let popupVisible = false;

        // Add hover events to marker
        el.addEventListener('mouseenter', () => {
          handleMarkerHover(el, popup, map, activePopupRef, hoverTimeoutRef);
          popupVisible = true;
        });
        
        // Add click event
        el.addEventListener('click', () => {
          // Create pulse effect on click
          el.animate([
            { transform: 'scale(1)', offset: 0 },
            { transform: 'scale(1.2)', offset: 0.5 },
            { transform: 'scale(1)', offset: 1 }
          ], {
            duration: 300,
            iterations: 1
          });
          
          // Keep popup open on click
          popupVisible = true;
          
          // Select the station
          onSelectStation(station);
        });

        // Add popup close event
        popup.on('close', () => {
          popupVisible = false;
          if (activePopupRef.current === popup) {
            activePopupRef.current = null;
          }
        });

        // Add click event to popup itself (to prevent closing when clicking on it)
        const popupContentElement = popup.getElement();
        if (popupContentElement) {
          popupContentElement.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }
      });
    };

    // Process markers in batches using requestAnimationFrame to prevent UI blocking
    const processBatch = (startIdx: number, batchSize: number) => {
      const endIdx = Math.min(startIdx + batchSize, markersToRender.length);
      createMarkerBatch(startIdx, endIdx);
      
      if (endIdx < markersToRender.length) {
        // Schedule next batch
        requestAnimationFrame(() => {
          processBatch(endIdx, batchSize);
        });
      }
    };

    // Begin batch processing with batches of 100
    processBatch(0, 100);
    
    // Update last rendered ref
    lastRenderedRef.current = {
      count: stations.length,
      ids: stationIds
    };

  }, [map, stations, stationIds, selectedStation, selectedId, onSelectStation, language, createPopupContent]);

  return { updateMarkers };
};
