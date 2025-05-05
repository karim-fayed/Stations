
import { useEffect } from 'react';
import './popup-fix-v2.css'; // استيراد ملف CSS الإضافي المحدث لإصلاح النوافذ المنبثقة
import './map-layers.css'; // استيراد ملف CSS لترتيب طبقات الخريطة
import './browser-compatibility.css'; // استيراد ملف CSS للتوافق مع مختلف المتصفحات
import './safari-fix.css'; // استيراد ملف CSS خاص بمتصفح سفاري

interface MapAnimationProps {
  enable: boolean;
}

const MapAnimation: React.FC<MapAnimationProps> = ({ enable = true }) => {
  // CSS للأنيميشن
  useEffect(() => {
    if (!enable) return;

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 119, 51, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(255, 119, 51, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 119, 51, 0);
        }
      }

      @keyframes bounce {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }

      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      .marker-pin {
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: all 0.3s ease;
      }

      .marker-pin:hover {
        filter: drop-shadow(0 0 8px rgba(255, 119, 51, 0.8)) !important;
      }

      .mapboxgl-popup-content {
        border-radius: 10px !important;
        overflow: hidden !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        padding: 12px !important;
      }

      .mapboxgl-popup {
        z-index: 9999 !important; /* زيادة z-index لتظهر أمام الدبابيس */
      }

      /* تعديلات إضافية لضمان ظهور النوافذ المنبثقة أمام الدبابيس */
      .mapboxgl-marker {
        z-index: 1 !important;
      }

      .mapboxgl-canvas {
        z-index: 0 !important;
      }

      .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
        border-top-color: white !important;
      }

      .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
        border-bottom-color: white !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [enable]);

  return null; // This component doesn't render any DOM elements
};

export default MapAnimation;
