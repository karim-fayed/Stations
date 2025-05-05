import mapboxgl from 'mapbox-gl';

/**
 * Updates the position of a selected marker for animation
 * @param map The mapbox map instance
 * @param marker The marker to update
 */
export const updateSelectedMarkerPosition = (
  map: mapboxgl.Map,
  marker: mapboxgl.Marker
): void => {
  if (!map || !marker) return;
  
  const markerElement = marker.getElement();
  if (!markerElement) return;
  
  // Get the marker's geographic coordinates
  const lngLat = marker.getLngLat();
  if (!lngLat) return;
  
  // Convert geographic coordinates to pixel coordinates
  const point = map.project(lngLat);
  
  // Set CSS variables for the animation
  markerElement.style.setProperty('--marker-x', `${point.x}px`);
  markerElement.style.setProperty('--marker-y', `${point.y}px`);
  
  // Apply the specific transform for the animation
  markerElement.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) translate(0px, 0px)`;
};

/**
 * Adds event listeners to update marker position during map movement
 * @param map The mapbox map instance
 * @param marker The marker to track
 * @returns A cleanup function to remove the event listeners
 */
export const addMarkerPositionTracking = (
  map: mapboxgl.Map,
  marker: mapboxgl.Marker
): () => void => {
  if (!map || !marker) return () => {};
  
  // Create the update function
  const updatePosition = () => updateSelectedMarkerPosition(map, marker);
  
  // Add event listeners
  map.on('move', updatePosition);
  map.on('zoom', updatePosition);
  map.on('pitch', updatePosition);
  map.on('rotate', updatePosition);
  
  // Initial update
  updatePosition();
  
  // Return cleanup function
  return () => {
    map.off('move', updatePosition);
    map.off('zoom', updatePosition);
    map.off('pitch', updatePosition);
    map.off('rotate', updatePosition);
  };
};
