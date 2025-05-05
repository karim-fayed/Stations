
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  userLocation: { latitude: number; longitude: number; accuracy?: number } | null;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ map, userLocation }) => {
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const accuracyCircleRef = useRef<mapboxgl.Source | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Check if map is loaded
  useEffect(() => {
    if (!map) return;

    // If the map is already loaded
    if (map.loaded()) {
      setMapLoaded(true);
    } else {
      // Listen for the load event
      const onLoadHandler = () => {
        console.log("Map style fully loaded");
        setMapLoaded(true);
      };

      map.on('load', onLoadHandler);

      return () => {
        map.off('load', onLoadHandler);
      };
    }
  }, [map]);

  // Update user location marker whenever location or map loaded state changes
  useEffect(() => {
    if (!map || !userLocation) {
      // Remove existing markers when location is not available
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      // Remove accuracy circle layer and source
      if (map) {
        try {
          if (map.getLayer('accuracy-circle-layer')) {
            map.removeLayer('accuracy-circle-layer');
          }

          if (map.getSource('accuracy-circle')) {
            map.removeSource('accuracy-circle');
            accuracyCircleRef.current = null;
          }
        } catch (err) {
          console.error("Error cleaning up location marker:", err);
        }
      }
      return;
    }

    // Wait for map to be loaded before adding markers
    if (!mapLoaded) {
      console.log("Waiting for map to load before adding user location marker");
      return;
    }

    // Remove existing markers
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create user location dot
    const markerEl = document.createElement('div');
    markerEl.className = 'user-location-marker';
    markerEl.style.width = '20px';
    markerEl.style.height = '20px';
    markerEl.style.borderRadius = '50%';
    markerEl.style.backgroundColor = '#4285F4';
    markerEl.style.border = '3px solid white';
    markerEl.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    markerEl.style.animation = 'pulse 1.5s infinite';
    markerEl.style.zIndex = '5';

    // Create an additional ripple effect container
    const pulsingDot = document.createElement('div');
    pulsingDot.className = 'user-location-pulse';
    pulsingDot.style.position = 'relative';
    pulsingDot.style.width = '20px';
    pulsingDot.style.height = '20px';

    // Add a pulsing effect
    const pulse1 = document.createElement('div');
    pulse1.style.position = 'absolute';
    pulse1.style.width = '100%';
    pulse1.style.height = '100%';
    pulse1.style.borderRadius = '50%';
    pulse1.style.backgroundColor = 'rgba(66, 133, 244, 0.3)';
    pulse1.style.opacity = '1';
    pulse1.style.animation = 'ripple 2s infinite ease-out';
    pulse1.style.transform = 'scale(1)';

    pulsingDot.appendChild(pulse1);
    pulsingDot.appendChild(markerEl);

    // Add the marker to the map
    userMarkerRef.current = new mapboxgl.Marker({
      element: pulsingDot,
      anchor: 'center'
    })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map);

    // Only add the accuracy circle if the map style is loaded
    if (mapLoaded && userLocation.accuracy && userLocation.accuracy > 0) {
      try {
        // Clean up any existing layers and sources first
        if (map.getLayer('accuracy-circle-layer')) {
          map.removeLayer('accuracy-circle-layer');
        }

        if (map.getSource('accuracy-circle')) {
          map.removeSource('accuracy-circle');
        }

        // Add a circle representing the accuracy
        map.addSource('accuracy-circle', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {
              'accuracy': userLocation.accuracy
            },
            'geometry': {
              'type': 'Point',
              'coordinates': [userLocation.longitude, userLocation.latitude]
            }
          }
        });

        accuracyCircleRef.current = map.getSource('accuracy-circle');

        // Add a circle layer using the accuracy radius
        map.addLayer({
          'id': 'accuracy-circle-layer',
          'type': 'circle',
          'source': 'accuracy-circle',
          'paint': {
            'circle-radius': {
              'stops': [
                [0, 0],
                [20, userLocation.accuracy]  // Mapbox converts meters to pixels based on zoom level
              ],
              'base': 2
            },
            'circle-color': 'rgba(66, 133, 244, 0.15)',
            'circle-stroke-width': 1,
            'circle-stroke-color': 'rgba(66, 133, 244, 0.4)'
          }
        });
      } catch (error) {
        console.error("Error adding accuracy circle:", error);
      }
    }

    // Add ripple animation style dynamically with vendor prefixes for better browser compatibility
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @-webkit-keyframes ripple {
        0% {
          -webkit-transform: scale(1);
          transform: scale(1);
          opacity: 0.8;
        }
        100% {
          -webkit-transform: scale(4);
          transform: scale(4);
          opacity: 0;
        }
      }

      @keyframes ripple {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }

      @-webkit-keyframes pulse {
        0% { -webkit-transform: scale(1); transform: scale(1); }
        50% { -webkit-transform: scale(1.1); transform: scale(1.1); }
        100% { -webkit-transform: scale(1); transform: scale(1); }
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      /* تحسينات لسفاري وأجهزة آبل */
      .user-location-marker {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-perspective: 1000;
        perspective: 1000;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // Remove style element if it exists
      if (styleEl && document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }

      // Clean up map layers and sources if map exists and is loaded
      if (map && map.loaded()) {
        try {
          // Check if layer exists before removing
          if (map.getStyle() && map.getLayer('accuracy-circle-layer')) {
            map.removeLayer('accuracy-circle-layer');
          }

          // Check if source exists before removing
          if (map.getStyle() && map.getSource('accuracy-circle')) {
            map.removeSource('accuracy-circle');
          }
        } catch (err) {
          console.error("Error cleaning up location marker on unmount:", err);
        }
      }
    };

  }, [map, userLocation, mapLoaded]);

  return null; // This component doesn't render any visible UI
};

export default UserLocationMarker;
