
import mapboxgl from 'mapbox-gl';
import { GasStation } from '@/types/station';

// Detect browser type
const isSafari = (): boolean => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isLowPerformance = (): boolean => {
  const isSlowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isSlowCPU || isMobile;
};

// Marker image URLs - centralized for easier management
const MARKER_URLS = {
  regular: '/lovable-uploads/27c1f136-856b-4b61-b332-3cea9403770a.png',
  selected: '/lovable-uploads/27c1f136-856b-4b61-b332-3cea9403770a.png'
};

// Pool of markers for reuse with lazy loading
const markerImageCache: {[key: string]: HTMLImageElement} = {};
let imagesLoaded = false;

// Optimized image preloading with lazy loading
export const preloadMarkerImages = () => {
  // Skip if already loaded
  if (imagesLoaded) return;

  // Detect browser capabilities
  const safari = isSafari();
  const iOS = isIOS();

  // Create a promise-based image loader
  const loadImage = (url: string, key: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      // Set up load handler
      if (safari || iOS) {
        // Safari/iOS specific handling
        img.src = url;
        setTimeout(() => {
          markerImageCache[key] = img;
          resolve();
        }, 100);
      } else {
        // Standard handling for other browsers
        img.onload = () => {
          markerImageCache[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load marker image: ${url}`);
          resolve();
        };
        img.src = url;
      }
    });
  };

  // Load all images in parallel
  Promise.all([
    loadImage(MARKER_URLS.regular, 'regular'),
    loadImage(MARKER_URLS.selected, 'selected')
  ]).then(() => {
    imagesLoaded = true;
    console.log('All marker images loaded successfully');
  });
};

// Create a marker pin element with improved performance and specific animation
export const createMarkerElement = (
  station: GasStation,
  selectedStationId: string | null
): HTMLDivElement => {
  const el = document.createElement('div') as HTMLDivElement;
  const isSelected = selectedStationId === station.id;
  const lowPerformance = isLowPerformance();

  // Use CSS classes for better performance
  if (isSelected) {
    // For selected markers, add the mapboxgl-marker classes to ensure proper animation
    el.className = 'marker-pin selected mapboxgl-marker mapboxgl-marker-anchor-center';
  } else {
    el.className = 'marker-pin';
  }

  // Apply minimal inline styles for essential positioning
  if (isSelected) {
    // Selected marker styles with specific animation support
    el.style.cssText = `
      width: 100%;
      height: 50%;
      background-image: url('${MARKER_URLS.selected}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center center;
      cursor: pointer;
      z-index: 10;
      will-change: transform;
      opacity: 1;
      pointer-events: auto;
      ${!lowPerformance ? 'animation: bounce 1s infinite alternate;' : ''}
    `;

    // Initialize CSS variables for animation
    el.style.setProperty('--marker-x', '0px');
    el.style.setProperty('--marker-y', '0px');
  } else {
    // Regular marker styles - optimized
    el.style.cssText = `
      width: 28px;
      height: 28px;
      background-image: url('${MARKER_URLS.regular}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      cursor: pointer;
      z-index: 1;
      will-change: transform;
    `;
  }

  // Add data attributes for easier selection
  el.dataset.stationId = station.id;
  el.dataset.markerType = isSelected ? 'selected' : 'regular';

  return el;
};

// Style popup close button - optimized with CSS class
export const stylePopupCloseButton = (popup: mapboxgl.Popup): void => {
  const popupElement = popup.getElement();
  if (popupElement) {
    const closeButton = popupElement.querySelector('.mapboxgl-popup-close-button');
    if (closeButton) {
      // Use a class instead of inline styles for better performance
      (closeButton as HTMLElement).innerHTML = '×';
      (closeButton as HTMLElement).classList.add('optimized-close-button');

      // Add minimal inline styles only if needed
      if (!document.querySelector('.optimized-close-button-styles')) {
        const style = document.createElement('style');
        style.className = 'optimized-close-button-styles';
        style.textContent = `
          .optimized-close-button {
            font-size: 16px;
            font-weight: bold;
            color: white;
            top: 8px;
            right: 8px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          .optimized-close-button:hover {
            background: rgba(0,0,0,0.5);
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
};

// Optimized popup creation with caching
const popupCache: Map<string, mapboxgl.Popup> = new Map();

// Create or get popup from cache
export const getPopup = (stationId: string, content: HTMLElement): mapboxgl.Popup => {
  if (popupCache.has(stationId)) {
    const popup = popupCache.get(stationId)!;
    popup.setDOMContent(content);
    return popup;
  }

  // Create new popup with optimized settings
  const popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false,
    offset: 25,
    className: 'station-popup',
    maxWidth: '300px',
    focusAfterOpen: false, // Improve performance by not focusing
  });

  // Set content and style
  popup.setDOMContent(content);
  stylePopupCloseButton(popup);

  // Cache for reuse
  popupCache.set(stationId, popup);

  return popup;
};

// Handle marker hover effect with improved debouncing and throttling
let lastPopupTime = 0;
const POPUP_THROTTLE_MS = 100; // Minimum time between popup displays

export const handleMarkerHover = (
  el: HTMLDivElement,
  popup: mapboxgl.Popup,
  map: mapboxgl.Map,
  activePopupRef: React.MutableRefObject<mapboxgl.Popup | null>,
  hoverTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
): void => {
  // Throttle popup display for better performance
  const now = Date.now();
  if (now - lastPopupTime < POPUP_THROTTLE_MS) {
    return;
  }

  // Cancel any previous timeout
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
  }

  // Close any active popup
  if (activePopupRef.current && activePopupRef.current !== popup) {
    activePopupRef.current.remove();
  }

  // Change marker appearance on hover - use class toggle for better performance
  el.classList.add('marker-hover');

  // Add slight delay to prevent popups from appearing too quickly during rapid mouse movement
  hoverTimeoutRef.current = setTimeout(() => {
    // Display popup
    popup.addTo(map);
    activePopupRef.current = popup;
    lastPopupTime = Date.now();
  }, 100); // Increased delay to reduce flickering
};

// Initialize once on load
preloadMarkerImages();
