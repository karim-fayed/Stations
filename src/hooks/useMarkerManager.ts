
import { useCallback, useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';
import { createMarkerElement, stylePopupCloseButton } from '@/components/map/utils/markerUtils';

interface MarkerManagerOptions {
  map: mapboxgl.Map | null;
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
  createPopupContent: (station: GasStation) => HTMLElement;
}

interface StationMarker {
  marker: mapboxgl.Marker;
  popup: mapboxgl.Popup;
  stationId: string;
}

export const useMarkerManager = ({
  map,
  stations,
  selectedStation,
  onSelectStation,
  language,
  createPopupContent
}: MarkerManagerOptions) => {
  const markersRef = useRef<StationMarker[]>([]);
  const activePopupRef = useRef<mapboxgl.Popup | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Check if map is loaded
  useEffect(() => {
    if (!map) return;
    
    if (map.loaded()) {
      setMapLoaded(true);
    } else {
      const onLoadHandler = () => {
        console.log("Map loaded in MarkerManager");
        setMapLoaded(true);
      };
      
      map.on('load', onLoadHandler);
      return () => {
        map.off('load', onLoadHandler);
      };
    }
  }, [map]);

  // Clear all markers from the map
  const clearMarkers = useCallback(() => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(({ marker }) => {
        marker.remove();
      });
      markersRef.current = [];
    }
  }, []);

  // Update markers on the map
  const updateMarkers = useCallback(() => {
    if (!map || !mapLoaded) {
      return;
    }

    console.log(`Updating ${stations.length} markers on map`);
    
    // Clear existing markers
    clearMarkers();

    // Add new markers
    stations.forEach(station => {
      try {
        // Create marker element
        const el = createMarkerElement(station, selectedStation?.id || null);
        
        // Create popup for this marker
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: 25,
          className: 'station-popup',
          maxWidth: '300px'
        });
        
        // Style the popup close button
        popup.setDOMContent(createPopupContent(station));
        stylePopupCloseButton(popup);
        
        // Create the marker
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([station.longitude, station.latitude])
          .addTo(map);
        
        // Add hover event for desktop devices
        el.addEventListener('mouseenter', () => {
          // Show popup on hover
          if (window.innerWidth > 768) { // Only on desktop
            popup.setLngLat([station.longitude, station.latitude]);
            
            // Close any active popup first
            if (activePopupRef.current && activePopupRef.current !== popup) {
              activePopupRef.current.remove();
            }
            
            // Show popup after a short delay to prevent flicker
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
            
            hoverTimeoutRef.current = setTimeout(() => {
              popup.addTo(map);
              activePopupRef.current = popup;
            }, 100);
          }
        });
        
        el.addEventListener('mouseleave', () => {
          // Clear hover timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          
          // Don't remove the popup right away to allow clicking on it
          setTimeout(() => {
            // Only close if it's not being interacted with
            const popupEl = popup.getElement();
            if (popupEl && !popupEl.matches(':hover')) {
              popup.remove();
              if (activePopupRef.current === popup) {
                activePopupRef.current = null;
              }
            }
          }, 300);
        });
        
        // Add click event
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectStation(station);
          
          // Remove any popups
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }
        });
        
        // Store the marker reference for later cleanup
        markersRef.current.push({
          marker,
          popup,
          stationId: station.id
        });
      } catch (err) {
        console.error(`Error creating marker for station ${station.id}:`, err);
      }
    });

    // If a station is selected, make sure its marker is on top
    if (selectedStation) {
      const selectedMarkerItem = markersRef.current.find(
        item => item.stationId === selectedStation.id
      );
      
      if (selectedMarkerItem) {
        // Bring selected marker to top
        selectedMarkerItem.marker.getElement().style.zIndex = '100';
      }
    }
  }, [map, stations, selectedStation, onSelectStation, clearMarkers, createPopupContent, mapLoaded]);

  // Clear markers when component unmounts
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, [clearMarkers]);

  return {
    updateMarkers
  };
};
