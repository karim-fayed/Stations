
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  userLocation: { latitude: number; longitude: number; accuracy?: number } | null;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ map, userLocation }) => {
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const accuracyCircleRef = useRef<mapboxgl.Source | null>(null);
  
  // Update user location marker whenever location changes
  useEffect(() => {
    if (!map || !userLocation) {
      // Remove existing markers when location is not available
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      
      // Remove accuracy circle layer and source
      if (map && map.getLayer('accuracy-circle-layer')) {
        map.removeLayer('accuracy-circle-layer');
      }
      
      if (map && map.getSource('accuracy-circle')) {
        map.removeSource('accuracy-circle');
        accuracyCircleRef.current = null;
      }
      return;
    }

    // Remove existing markers
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    
    // Remove accuracy circle layer and source if they exist
    if (map.getLayer('accuracy-circle-layer')) {
      map.removeLayer('accuracy-circle-layer');
    }
    
    if (map.getSource('accuracy-circle')) {
      map.removeSource('accuracy-circle');
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

    // If accuracy is available, add accuracy circle
    if (userLocation.accuracy && userLocation.accuracy > 0) {
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
      if (map) {
        if (map.getLayer('accuracy-circle-layer')) {
          map.removeLayer('accuracy-circle-layer');
        }
        
        if (map.getSource('accuracy-circle')) {
          map.removeSource('accuracy-circle');
        }
      }
    };

  }, [map, userLocation]);

  return null; // This component doesn't render any visible UI
};

export default UserLocationMarker;
