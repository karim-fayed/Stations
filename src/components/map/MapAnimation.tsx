
import { useEffect } from 'react';

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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [enable]);

  return null; // This component doesn't render any DOM elements
};

export default MapAnimation;
