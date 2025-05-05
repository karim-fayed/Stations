
import { useCallback, useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';
import { createMarkerElement, stylePopupCloseButton, getPopup, handleMarkerHover } from '@/components/map/utils/markerUtils';
import { addMarkerPositionTracking } from '@/utils/markerAnimationUtils';
import '../components/map/marker-styles.css';

// Detect if device is likely low performance
const detectLowPerformanceDevice = (): boolean => {
  // Check for various indicators of low-performance devices
  const isSlowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return isSlowCPU || isMobile;
};

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

  // Update markers on the map with optimized performance
  const updateMarkers = useCallback(() => {
    if (!map || !mapLoaded) {
      return;
    }

    console.log(`Updating ${stations.length} markers on map`);

    // Check if we're on a low-performance device
    const lowPerformance = detectLowPerformanceDevice();

    // Get current map bounds to only render visible markers
    const bounds = map.getBounds();

    // Clear existing markers
    clearMarkers();

    // Use batch processing for better performance with large datasets
    const processBatch = (startIndex: number, batchSize: number) => {
      // Process only a batch of stations at a time
      const endIndex = Math.min(startIndex + batchSize, stations.length);
      const visibleStations = stations.slice(startIndex, endIndex).filter(station => {
        // Only create markers for stations in the current viewport (with padding)
        return bounds.contains([station.longitude, station.latitude]);
      });

      // Add markers for this batch
      visibleStations.forEach(station => {
        try {
          // Create marker element with optimized styling
          const el = createMarkerElement(station, selectedStation?.id || null);

          // Get popup from cache or create a new one
          const popup = getPopup(station.id, createPopupContent(station));

          // Create the marker with error handling
          let marker;
          try {
            // Check if map is valid before adding marker
            if (map && map.getContainer()) {
              marker = new mapboxgl.Marker({
                element: el,
                // Optimize for performance
                anchor: 'bottom',
                offset: [0, 0],
                // Disable dragging for better performance
                draggable: false,
              })
              .setLngLat([station.longitude, station.latitude]);

              // Safely add marker to map
              marker.addTo(map);
            } else {
              console.warn(`Map not ready for station ${station.id}, skipping marker creation`);
              return; // Skip this marker if map is not ready
            }
          } catch (err) {
            console.error(`Error adding marker for station ${station.id}:`, err);
            return; // Skip this marker if there's an error
          }

          // Add hover event for desktop devices only
          if (!lowPerformance && window.innerWidth > 768) {
            el.addEventListener('mouseenter', () => {
              // Use optimized hover handler
              handleMarkerHover(el, popup, map, activePopupRef, hoverTimeoutRef);
            });

            el.addEventListener('mouseleave', () => {
              // Clear hover timeout
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }

              // Remove hover styling
              el.classList.remove('marker-hover');

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
          }

          // Add click event with optimized handler - keep pin visible
          el.addEventListener('click', (e) => {
            e.stopPropagation();

            // Select the station without removing the marker
            onSelectStation(station);

            // Keep the marker visible by not removing it
            // Just remove any active popups to avoid clutter
            if (activePopupRef.current) {
              activePopupRef.current.remove();
              activePopupRef.current = null;
            }

            // Highlight the clicked marker immediately
            const markerElement = marker.getElement();
            markerElement.className = 'marker-pin selected mapboxgl-marker mapboxgl-marker-anchor-center';
            markerElement.style.opacity = '1';
            markerElement.style.pointerEvents = 'auto';
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

      // Process next batch if needed
      if (endIndex < stations.length) {
        // Use requestAnimationFrame for smoother UI during batch processing
        window.requestAnimationFrame(() => {
          processBatch(endIndex, batchSize);
        });
      } else {
        // All batches processed, now handle selected station
        highlightSelectedStation();
      }
    };

    // Highlight the selected station marker with the specific animation
    const highlightSelectedStation = () => {
      if (selectedStation) {
        const selectedMarkerItem = markersRef.current.find(
          item => item.stationId === selectedStation.id
        );

        if (selectedMarkerItem) {
          // Get the marker element
          const markerElement = selectedMarkerItem.marker.getElement();

          // Use CSS classes for styling
          markerElement.className = 'marker-pin selected mapboxgl-marker mapboxgl-marker-anchor-center';

          // Get the marker position for animation
          const lngLat = selectedMarkerItem.marker.getLngLat();
          if (map && lngLat) {
            // Project the geographic coordinates to pixel coordinates
            const point = map.project(lngLat);

            // Set CSS variables for the marker position to be used in the animation
            markerElement.style.setProperty('--marker-x', `${point.x}px`);
            markerElement.style.setProperty('--marker-y', `${point.y}px`);

            // Apply the specific transform for the animation
            markerElement.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) translate(0px, 0px)`;

            // Apply additional styling for selected markers
            markerElement.style.width = '100%';
            markerElement.style.height = '50%';
            markerElement.style.zIndex = '10';
            markerElement.style.opacity = '1';
            markerElement.style.pointerEvents = 'auto';

            // Fly to the selected marker - use faster animation for better responsiveness
            map.flyTo({
              center: lngLat,
              zoom: 14,
              essential: true,
              duration: 800, // Faster animation
              easing: (t) => t // Linear easing for faster response
            });

            // Make sure the marker stays visible
            setTimeout(() => {
              // Re-apply styles after a short delay to ensure visibility
              if (markerElement) {
                markerElement.style.opacity = '1';
                markerElement.style.visibility = 'visible';
                markerElement.style.display = 'block';
              }
            }, 100);

            // Add marker position tracking with our utility function
            // This will update the marker position during map movement
            addMarkerPositionTracking(map, selectedMarkerItem.marker);
          }
        }
      }
    };

    // Start batch processing with appropriate batch size based on device performance
    const batchSize = lowPerformance ? 10 : 30;
    processBatch(0, batchSize);

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
