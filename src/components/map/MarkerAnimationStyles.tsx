
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
        z-index: 10;
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
