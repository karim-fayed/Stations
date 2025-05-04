
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
      // إنشاء عنصر HTML للمُعلّمة بشكل دبوس
      const el = document.createElement('div');
      const isSelected = selectedStation?.id === station.id;
      
      // تعيين الأنماط CSS للدبوس
      el.className = 'marker-pin';
      el.style.width = isSelected ? '38px' : '28px';
      el.style.height = isSelected ? '38px' : '28px';
      el.style.backgroundImage = "url('/lovable-uploads/27c1f136-856b-4b61-b332-3cea9403770a.png')";
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.cursor = 'pointer';
      el.style.filter = isSelected ? 'drop-shadow(0 0 8px rgba(255, 119, 51, 0.8))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))';
      el.style.transition = 'all 0.3s ease-in-out';
      
      // إضافة تأثير نبض للمُعلّمة المحددة
      if (isSelected) {
        el.style.animation = 'bounce 1s infinite alternate';
        
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
        offset: 25,
        className: 'station-popup'
      }).setDOMContent(createPopupContent(station));
      
      popupsRef.current.push(popup);

      // إنشاء مُعلّم وإضافتها إلى الخريطة
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
        offset: [0, -5] // تعديل الإزاحة ليبدو الدبوس في المكان الصحيح
      })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map);

      // إضافة أحداث hover
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1) translateY(-5px)';
        popup.addTo(map);
      });
      
      el.addEventListener('mouseleave', () => {
        if (!isSelected) {
          el.style.transform = 'scale(1) translateY(0)';
        }
        popup.remove();
      });

      // إضافة حدث النقر
      el.addEventListener('click', () => {
        // إنشاء تأثير نبضة عند النقر
        el.animate([
          { transform: 'scale(1)', offset: 0 },
          { transform: 'scale(1.2)', offset: 0.5 },
          { transform: 'scale(1)', offset: 1 }
        ], {
          duration: 300,
          iterations: 1
        });
        
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

  // إضافة أنماط CSS للأنيميشن
  useEffect(() => {
    // إنشاء عنصر style للأنيميشن
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-10px); }
      }
      
      .station-popup {
        animation: fadeIn 0.3s ease-out;
        border-radius: 10px;
        overflow: hidden;
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return null; // This is a logic-only component, it doesn't render anything
};

export default MapMarkerManager;
