
import React, { useEffect } from 'react';

const MarkerAnimationStyles: React.FC = () => {
  useEffect(() => {
    // Create style element for animation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-10px); }
      }

      /* تعريف أنيميشن للدبابيس المحددة */
      .marker-pin.selected.mapboxgl-marker.mapboxgl-marker-anchor-center {
        width: 100% !important;
        height: 50% !important;
        background-image: url(/lovable-uploads/27c1f136-856b-4b61-b332-3cea9403770a.png) !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center center !important;
        cursor: pointer !important;
        transition: 0.3s ease-in-out !important;
        transform-origin: center bottom !important;
        z-index: 10 !important;
        will-change: filter, transform, width, height !important;
        animation: 1s ease 0s infinite alternate none running bounce !important;
        transform: translate(480px, 280px) translate(-50%, -50%) translate(0px, 0px) !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
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

      .station-popup {
        animation: fadeIn 0.3s ease-out;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999 !important; /* زيادة z-index لتظهر أمام الدبابيس */
        max-width: 300px;
        pointer-events: auto !important; /* يسمح بالتفاعل مع النافذة المنبثقة */
        position: relative !important;
      }

      .station-popup .mapboxgl-popup-content {
        padding: 0 !important;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25) !important;
      }

      /* تخصيص زر الإغلاق */
      .station-popup .mapboxgl-popup-close-button {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 50%;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        z-index: 10;
        transition: background-color 0.2s;
      }

      .station-popup .mapboxgl-popup-close-button:hover {
        background-color: rgba(0, 0, 0, 0.4);
      }

      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      /* تحسين استقرار النوافذ المنبثقة */
      .mapboxgl-popup {
        z-index: 9999 !important; /* زيادة z-index لتظهر أمام الدبابيس */
      }

      /* تعديلات إضافية للنوافذ المنبثقة */
      .mapboxgl-popup-content {
        z-index: 9999 !important;
        position: relative !important;
      }

      .mapboxgl-popup-tip {
        z-index: 9998 !important;
      }

      /* تعديلات للدبابيس */
      .mapboxgl-marker {
        z-index: 1 !important;
      }

      /* User location marker styles */
      .user-location-marker {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #4285F4;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        animation: pulse 1.5s infinite;
        z-index: 5;
      }

      .user-location-pulse {
        position: relative;
        width: 20px;
        height: 20px;
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return null; // This is a styling-only component, it doesn't render anything
};

export default MarkerAnimationStyles;
