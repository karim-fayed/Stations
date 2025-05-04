import { useRef, useCallback } from 'react';
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

  // Update markers on the map
  const updateMarkers = useCallback(() => {
    // Remove all existing markers and popups
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];

    // Cancel any active timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // If map isn't ready yet, don't do anything
    if (!map) return;

    // Create a marker for each station
    stations.forEach(station => {
      // Create HTML element for the marker (pin)
      const el = createMarkerElement(station, selectedStation?.id || null);
      
      // If selected, fly map to station
      if (selectedStation?.id === station.id) {
        map.flyTo({
          center: [station.longitude, station.latitude],
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
  }, [stations, selectedStation, onSelectStation, map, createPopupContent, language]);

  return { updateMarkers };
};
