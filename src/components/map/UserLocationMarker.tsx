
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
    
    const handleMapLoad = () => {
      console.log("Map style fully loaded");
      setMapLoaded(true);
    };

    // If the map is already loaded
    if (map.loaded()) {
      setMapLoaded(true);
    } else {
      // Listen for the load event
      map.on('load', handleMapLoad);
    }
    
    return () => {
      if (map) {
        map.off('load', handleMapLoad);
      }
    };
  }, [map]);
  
  // Update user location marker whenever location or map loaded state changes
  useEffect(() => {
    if (!map) {
      return;
    }
    
    // Clean up function for removing map elements
    const cleanUpMapLayers = () => {
      if (!map) return;
      
      // Clean up marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      
      // Clean up accuracy circle layer and source safely
      try {
        if (map.getLayer('accuracy-circle-layer')) {
          map.removeLayer('accuracy-circle-layer');
        }
        
        if (map.getSource('accuracy-circle')) {
          map.removeSource('accuracy-circle');
          accuracyCircleRef.current = null;
        }
      } catch (error) {
        console.error("Error cleaning up map layers:", error);
      }
    };
    
    // If no user location, clean up and return
    if (!userLocation) {
      cleanUpMapLayers();
      return;
    }

    // Clean up existing elements before adding new ones
    cleanUpMapLayers();
    
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

    try {
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
          // Add a circle representing the accuracy if the map is loaded
          if (map.loaded()) {
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
          }
        } catch (error) {
          console.error("Error adding accuracy circle:", error);
        }
      }
    } catch (error) {
      console.error("Error setting up user location marker:", error);
    }

    // Add ripple animation style dynamically
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
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
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
      cleanUpMapLayers();
    };

  }, [map, userLocation, mapLoaded]);

  return null; // This component doesn't render any visible UI
};

export default UserLocationMarker;
