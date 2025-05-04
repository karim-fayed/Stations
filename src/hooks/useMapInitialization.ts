
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { useToast } from "@/hooks/use-toast";
import { Language } from '@/i18n/translations';

export const useMapInitialization = (language: Language) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Avoid re-initialization

    // Configure Mapbox error handling to prevent console flooding
    mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      null,
      true // Lazy load the RTL plugin
    );

    if (mapContainer.current) {
      try {
        // Center initially on Saudi Arabia
        const initialCenter: [number, number] = [45.079, 23.885]; // Center of Saudi Arabia
        const initialZoom = 5;

        // Set Mapbox token
        mapboxgl.accessToken = MAPBOX_TOKEN;

        // Create map with optimized configuration
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: initialCenter,
          zoom: initialZoom,
          attributionControl: false,
          // Add optimized rendering settings
          renderWorldCopies: false,
          preserveDrawingBuffer: false,
          antialias: false,
          maxZoom: 18,
          minZoom: 3,
          fadeDuration: 100, // Reduce fade duration for better performance
          trackResize: true,
          // Remove the unsupported property
          useRequestAnimationFrame: true, // Ensure animation frame is properly used
        });

        // Add map controls but delay until the map loads
        map.current.on('load', () => {
          if (map.current) {
            // Add map controls
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
            map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'metric' }), 'bottom-right');
            
            // Show welcome toast
            toast({
              title: language === Language.ARABIC ? 'مرحبًا بك في خريطة المحطات' : 'Welcome to the stations map',
              description: language === Language.ARABIC ? 'يرجى اختيار مدينة لعرض المحطات' : 'Please select a city to view stations',
            });

            console.log("Map style fully loaded");
          }
        });

        // Handle map errors
        map.current.on('error', (e) => {
          // Only log critical map errors, type-safe error handling
          const mapError = e.error as { status?: number };
          if (mapError && mapError.status !== 401 && mapError.status !== 404) {
            console.error('Mapbox error:', e.error);
          }
        });

        // Optimize frame rate
        if (map.current) {
          // Throttle expensive operations on move events
          map.current.on('move', () => {
            // Throttling handled internally by Mapbox
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: language === Language.ARABIC ? 'خطأ في تحميل الخريطة' : 'Map loading error',
          description: language === Language.ARABIC ? 'حدث خطأ أثناء تحميل الخريطة' : 'Error loading the map',
          variant: 'destructive',
        });
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [language, toast]);

  return { mapContainer, map };
};
