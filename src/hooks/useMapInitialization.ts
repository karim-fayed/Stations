
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { useToast } from "@/hooks/use-toast";

// Detect if device is likely low performance
const detectLowPerformanceDevice = (): boolean => {
  // Check for various indicators of low-performance devices
  const isSlowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return isSlowCPU || isMobile;
};

// Detect browser type
const isSafari = (): boolean => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export const useMapInitialization = (language: 'ar' | 'en') => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();
  const controlsAddedRef = useRef(false);

  // Initialize map with optimized settings
  useEffect(() => {
    if (map.current) return; // Avoid re-initialization

    if (mapContainer.current) {
      // Center initially on Saudi Arabia
      const initialCenter: [number, number] = [45.079, 23.885]; // Center of Saudi Arabia
      const initialZoom = 5;

      // Set Mapbox token
      mapboxgl.accessToken = MAPBOX_TOKEN;

      try {
        // Check device capabilities
        const safari = isSafari();
        const iOS = isIOS();
        const lowPerformance = detectLowPerformanceDevice();

        // Create optimized map configuration
        const mapConfig: mapboxgl.MapboxOptions = {
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12', // Consider using a lighter style for low-performance devices
          center: initialCenter,
          zoom: initialZoom,
          attributionControl: false,
          // Performance optimizations
          fadeDuration: (iOS || safari) ? 0 : 300,
          preserveDrawingBuffer: iOS || safari,
          antialias: !lowPerformance, // Disable for low-performance devices
          maxZoom: lowPerformance ? 16 : 18, // Lower max zoom for better performance
          minZoom: 3,
          renderWorldCopies: !lowPerformance, // Disable for low-performance devices
          localIdeographFontFamily: "'Noto Sans', 'Noto Sans Arabic', sans-serif",
          // Additional performance optimizations
          trackResize: true,
          boxZoom: !lowPerformance,
          dragRotate: !lowPerformance,
          pitchWithRotate: !lowPerformance,
        };

        // Initialize map with optimized settings
        map.current = new mapboxgl.Map(mapConfig);

        // Add essential event listeners
        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
        });

        // Defer adding controls until after map is loaded for faster initial render
        map.current.on('load', () => {
          console.log("Map style fully loaded");
          setMapLoaded(true);

          // Add controls after map is loaded to improve initial load time
          if (!controlsAddedRef.current && map.current) {
            // Add minimal controls for better performance
            map.current.addControl(new mapboxgl.NavigationControl({
              showCompass: !lowPerformance,
              showZoom: true,
              visualizePitch: !lowPerformance
            }), 'top-right');

            // Only add fullscreen control on desktop
            if (!iOS && !lowPerformance) {
              map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
            }

            // Add scale control
            map.current.addControl(new mapboxgl.ScaleControl({
              maxWidth: 100,
              unit: language === 'ar' ? 'metric' : 'imperial'
            }), 'bottom-right');

            controlsAddedRef.current = true;
          }

          // Show welcome toast
          toast({
            title: language === 'ar' ? 'مرحبًا بك في خريطة المحطات' : 'Welcome to the stations map',
            description: language === 'ar' ? 'يرجى اختيار مدينة لعرض المحطات' : 'Please select a city to view stations',
          });
        });

        // Optimize Safari/iOS rendering
        if (iOS || safari) {
          // Use a more efficient approach to trigger repaints
          let lastRepaint = 0;
          map.current.on('render', () => {
            const now = Date.now();
            // Limit repaint frequency to improve performance
            if (map.current && !map.current.isMoving() && !map.current.isZooming() && now - lastRepaint > 1000) {
              lastRepaint = now;
              map.current.triggerRepaint();
            }
          });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        toast({
          title: language === 'ar' ? 'خطأ في تحميل الخريطة' : 'Error loading map',
          description: language === 'ar' ? 'يرجى إعادة تحميل الصفحة' : 'Please refresh the page',
          variant: 'destructive'
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

  return { mapContainer, map, mapLoaded };
};
