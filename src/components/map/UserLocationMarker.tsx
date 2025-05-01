
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  userLocation: { latitude: number; longitude: number } | null;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ map, userLocation }) => {
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Update user location marker whenever location changes
  useEffect(() => {
    if (!map || !userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    // حذف مؤشر المستخدم الحالي إذا وجد
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // إضافة مُعلّم لموقع المستخدم
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4285F4';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    el.style.animation = 'pulse 1.5s infinite';

    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map);

  }, [map, userLocation]);

  return null; // This component doesn't render any visible UI
};

export default UserLocationMarker;
