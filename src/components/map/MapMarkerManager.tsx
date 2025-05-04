
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
  const activePopupRef = useRef<mapboxgl.Popup | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // تحديث المُعلّمات (markers) على الخريطة
  const updateMarkers = useCallback(() => {
    // حذف جميع المُعلّمات والنوافذ المنبثقة الموجودة
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];

    // إلغاء أي مؤقتات نشطة
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

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
      el.style.transformOrigin = 'center bottom'; // تعيين نقطة التحول للتأثيرات
      
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
        className: 'station-popup',
        maxWidth: '300px', // تعيين العرض الأقصى للنافذة المنبثقة
        anchor: 'bottom' // جعل النافذة المنبثقة تظهر فوق الدبوس دائمًا
      }).setDOMContent(createPopupContent(station));
      
      popupsRef.current.push(popup);

      // إنشاء مُعلّم وإضافتها إلى الخريطة
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
        offset: [0, -5] // تعديل الإزاحة ليبدو الدبوس في المكان الصحيح
      })
        .setLngLat([station.longitude, station.latitude])
        .addTo(map);

      // إضافة المعلم إلى المرجع
      markersRef.current.push(marker);

      // تحسين سلوك التفاعل مع المؤشر - منع "هروب" النافذة المنبثقة
      let isHovering = false;
      let popupVisible = false;

      // إضافة أحداث hover للمُعلّمة
      el.addEventListener('mouseenter', () => {
        isHovering = true;

        // إلغاء أي مؤقت سابق
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }

        // إغلاق أي نافذة منبثقة نشطة
        if (activePopupRef.current) {
          activePopupRef.current.remove();
        }

        // تطبيق تأثيرات المؤشر
        el.style.transform = 'scale(1.1) translateY(-5px)';
        el.style.filter = 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.4))';
        
        // إظهار النافذة المنبثقة
        popup.addTo(map);
        popupVisible = true;
        activePopupRef.current = popup;

        // إضافة أحداث hover للنافذة المنبثقة نفسها
        const popupElement = popup.getElement();
        
        // الاستماع لأحداث دخول المؤشر للنافذة المنبثقة
        if (popupElement) {
          popupElement.addEventListener('mouseenter', () => {
            isHovering = true;
            
            // إلغاء أي مؤقت عند دخول المؤشر للنافذة المنبثقة
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          });
          
          // الاستماع لأحداث خروج المؤشر من النافذة المنبثقة
          popupElement.addEventListener('mouseleave', () => {
            isHovering = false;
            
            // تأخير إزالة النافذة المنبثقة لتوفير وقت أكبر للمستخدم
            // تم زيادة التأخير لمنع اختفاء النافذة المنبثقة سريعًا
            hoverTimeoutRef.current = setTimeout(() => {
              if (!isHovering && popupVisible) {
                // لا نزيل النافذة المنبثقة إلا إذا كان المؤشر بعيدًا عن الدبوس والنافذة المنبثقة
                if (!isSelected) { // لا نزيل النافذة المنبثقة إذا كانت المحطة محددة
                  popup.remove();
                  popupVisible = false;
                  activePopupRef.current = null;
                }
              }
            }, 1000); // زيادة التأخير إلى 1 ثانية
          });
        }
      });
      
      // الاستماع لأحداث خروج المؤشر من المُعلّمة
      el.addEventListener('mouseleave', () => {
        isHovering = false;
        
        // تأخير إزالة النافذة المنبثقة وإعادة المُعلّمة إلى الحجم الطبيعي
        // تم زيادة التأخير لمنع اختفاء النافذة المنبثقة سريعًا
        hoverTimeoutRef.current = setTimeout(() => {
          if (!isHovering && popupVisible) {
            if (!isSelected) {
              el.style.transform = 'scale(1) translateY(0)';
              el.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))';
              popup.remove();
              popupVisible = false;
              activePopupRef.current = null;
            }
          }
        }, 1000); // زيادة التأخير إلى 1 ثانية
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
        
        // نحتفظ بالنافذة المنبثقة مفتوحة عند النقر
        popupVisible = true;
        
        // تحديد المحطة
        onSelectStation(station);
      });
    });
  }, [stations, selectedStation, onSelectStation, map, createPopupContent, language]);

  // تحديث المعلمات عند تغير المحطات أو المحطة المحددة
  useEffect(() => {
    updateMarkers();
    
    // تنظيف المؤقتات عند إلغاء التحميل
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    };
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
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .station-popup {
        animation: fadeIn 0.3s ease-out;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 5;
        max-width: 300px;
        pointer-events: auto !important; /* يسمح بالتفاعل مع النافذة المنبثقة */
      }
      
      .station-popup .mapboxgl-popup-content {
        padding: 0 !important;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25) !important;
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
