
import React, { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';

interface MapMarkerManagerProps {
  map: mapboxgl.Map | null;
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
  createPopupContent: (station: GasStation) => HTMLElement;
}

const MapMarkerManager: React.FC<MapMarkerManagerProps> = ({
  map,
  stations,
  selectedStation,
  onSelectStation,
  language,
  createPopupContent
}) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  
  // تحديث المُعلّمات (markers) على الخريطة
  const updateMarkers = useCallback(() => {
    // حذف جميع المُعلّمات والنوافذ المنبثقة الموجودة
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];

    // إذا لم تكن الخريطة جاهزة بعد، لا تفعل شيئًا
    if (!map) return;

    // إنشاء مُعلّم لكل محطة
    stations.forEach(station => {
      // إنشاء عنصر HTML للمُعلّمة
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = selectedStation?.id === station.id ? '#ff7733' : '#6633cc';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      el.style.transition = 'all 0.3s ease';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '12px';
      
      // إضافة رمز أو رقم للمُعلّمة
      el.textContent = station.id.substring(0, 1);
      
      // إضافة تأثير نبض للمُعلّمة المحددة
      if (selectedStation?.id === station.id) {
        el.style.animation = 'pulse 1.5s infinite';
        
        // تمرير الخريطة إلى المحطة المحددة
        map.flyTo({
          center: [station.longitude, station.latitude],
          zoom: 14,
          essential: true,
          duration: 1000
        });
      }

      // إنشاء popup للمحطة
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
      }).setDOMContent(createPopupContent(station));
      
      popupsRef.current.push(popup);

      // إنشاء مُعلّم وإضافتها إلى الخريطة
      const marker = new mapboxgl.Marker(el)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map);

      // إضافة أحداث hover
      el.addEventListener('mouseenter', () => {
        popup.addTo(map);
      });
      
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // إضافة حدث النقر
      el.addEventListener('click', () => {
        onSelectStation(station);
      });

      // تخزين المُعلّم في المرجع
      markersRef.current.push(marker);
    });
  }, [stations, selectedStation, onSelectStation, map, createPopupContent, language]);

  // تحديث المعلمات عند تغير المحطات أو المحطة المحددة
  useEffect(() => {
    updateMarkers();
  }, [stations, selectedStation, updateMarkers]);

  return null; // This is a logic-only component, it doesn't render anything
};

export default MapMarkerManager;
