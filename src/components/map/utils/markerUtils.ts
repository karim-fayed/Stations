
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';

// Create a marker pin element
export const createMarkerElement = (
  station: GasStation,
  selectedStationId: string | null
): HTMLDivElement => {
  const el = document.createElement('div') as HTMLDivElement;
  const isSelected = selectedStationId === station.id;
  
  // Set CSS styles for the pin
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
  el.style.transformOrigin = 'center bottom';
  
  // Add pulse animation for selected marker
  if (isSelected) {
    el.style.animation = 'bounce 1s infinite alternate';
  }
  
  return el;
};

// Style popup close button
export const stylePopupCloseButton = (popup: mapboxgl.Popup): void => {
  const popupElement = popup.getElement();
  if (popupElement) {
    const closeButton = popupElement.querySelector('.mapboxgl-popup-close-button');
    if (closeButton) {
      (closeButton as HTMLElement).innerHTML = '×';
      (closeButton as HTMLElement).style.fontSize = '16px';
      (closeButton as HTMLElement).style.fontWeight = 'bold';
      (closeButton as HTMLElement).style.color = 'white';
      (closeButton as HTMLElement).style.top = '8px';
      (closeButton as HTMLElement).style.right = '8px';
    }
  }
};

// Handle marker hover effect
export const handleMarkerHover = (
  el: HTMLDivElement,
  popup: mapboxgl.Popup,
  map: mapboxgl.Map,
  activePopupRef: React.MutableRefObject<mapboxgl.Popup | null>,
  hoverTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
): void => {
  // Cancel any previous timeout
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
  }

  // Close any active popup
  if (activePopupRef.current && activePopupRef.current !== popup) {
    activePopupRef.current.remove();
  }

  // Change marker appearance on hover
  el.style.filter = 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))';
  
  // Display popup
  popup.addTo(map);
  activePopupRef.current = popup;
};
