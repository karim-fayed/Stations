
import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';

interface UseMarkerManagerProps {
  map: mapboxgl.Map | null;
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation) => void;
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
  const markersRef = new Map<string, mapboxgl.Marker>();

  // Update markers on the map
  const updateMarkers = useCallback(() => {
    if (!map) {
      return;
    }

    try {
      // Clear existing markers
      markersRef.forEach((marker) => {
        if (marker) {
          try {
            marker.remove();
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        }
      });
      markersRef.clear();

      // Safety check - sometimes stations can be undefined during loading
      if (!stations || !Array.isArray(stations)) {
        console.warn('Stations not available for marker update');
        return;
      }

      // Add markers for each station with error handling
      stations.forEach((station) => {
        try {
          // Skip stations with invalid coordinates
          if (!station || !station.latitude || !station.longitude) {
            console.warn('Station has invalid coordinates', station?.id);
            return;
          }
          
          // Determine if this station is selected
          const isSelected = selectedStation?.id === station.id;

          // Create custom marker element
          const el = document.createElement('div');
          el.className = `station-marker ${isSelected ? 'selected' : ''}`;
          el.style.width = isSelected ? '42px' : '36px';
          el.style.height = isSelected ? '42px' : '36px';
          el.style.backgroundColor = isSelected ? '#6633cc' : '#9966cc';
          el.style.border = '2px solid #ffffff';
          el.style.borderRadius = '50%';
          el.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
          el.style.cursor = 'pointer';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.transition = 'all 0.2s ease';
          el.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
          el.style.zIndex = isSelected ? '2' : '1';

          // Add gas station icon
          const icon = document.createElement('div');
          icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '22' : '18'}" height="${isSelected ? '22' : '18'}" 
                 viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 22h12"></path>
              <path d="M5 22V11c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v11"></path>
              <path d="M3 7V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"></path>
              <path d="M17 22V9"></path>
              <path d="M15 7V5c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2h-3"></path>
              <path d="M19 5V3"></path>
            </svg>`;
          el.appendChild(icon);

          try {
            // Generate popup content
            const popupContent = createPopupContent(station);
            
            // Create popup with error handling
            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: true,
              anchor: 'bottom',
              offset: [0, -15],
              className: `gas-station-popup ${language === 'ar' ? 'arabic-popup' : ''}`
            })
              .setDOMContent(popupContent)
              .on('close', () => {
                if (selectedStation?.id === station.id) {
                  // Do nothing here - we don't want to deselect the station when popup is closed
                }
              });

            // Add marker to map
            const marker = new mapboxgl.Marker({
              element: el
            })
              .setLngLat([station.longitude, station.latitude])
              .setPopup(popup)
              .addTo(map);

            // Add click event to marker
            el.addEventListener('click', () => {
              // Select the station when marker is clicked
              onSelectStation(station);
              
              // Toggle popup (show or hide)
              marker.togglePopup();
            });

            // Add hover effects
            el.addEventListener('mouseenter', () => {
              if (selectedStation?.id !== station.id) {
                el.style.backgroundColor = '#7F00FF';
                el.style.transform = 'scale(1.05)';
              }
            });

            el.addEventListener('mouseleave', () => {
              if (selectedStation?.id !== station.id) {
                el.style.backgroundColor = '#9966cc';
                el.style.transform = 'scale(1)';
              }
            });

            // Store marker reference
            markersRef.set(station.id, marker);
          } catch (popupError) {
            console.error("Error creating popup for station", station.id, popupError);
          }
        } catch (stationError) {
          console.error("Error processing station marker", stationError);
        }
      });

      // Open popup for selected station
      if (selectedStation) {
        try {
          const selectedMarker = markersRef.get(selectedStation.id);
          if (selectedMarker) {
            const popup = selectedMarker.getPopup();
            if (popup && !popup.isOpen()) {
              selectedMarker.togglePopup();
            }
          }
        } catch (popupError) {
          console.error("Error showing popup for selected station", popupError);
        }
      }
    } catch (error) {
      console.error("Error updating markers:", error);
    }
  }, [map, stations, selectedStation, onSelectStation, language, createPopupContent]);

  return {
    updateMarkers
  };
};
