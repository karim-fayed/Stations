
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { useToast } from "@/hooks/use-toast";

export const useMapInitialization = (language: 'ar' | 'en') => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();
  
  // List of alternative map styles to try if the primary one fails
  const mapStyles = [
    'mapbox://styles/mapbox/streets-v12',
    'mapbox://styles/mapbox/light-v11',
    'mapbox://styles/mapbox/dark-v11',
    'mapbox://styles/mapbox/outdoors-v12'
  ];

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Avoid re-initialization

    // Check if mapboxgl token is configured
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token is not defined');
      toast({
        title: language === 'ar' ? 'خطأ في تهيئة الخريطة' : 'Map initialization error',
        description: language === 'ar' ? 'الرجاء التحقق من إعدادات الخريطة' : 'Please check map configuration',
        variant: 'destructive'
      });
      return;
    }

    // Set mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (mapContainer.current) {
      try {
        // Center initially on Saudi Arabia
        const initialCenter: [number, number] = [45.079, 23.885]; // Center of Saudi Arabia
        const initialZoom = 5;

        // Use a local variable to track style loading attempts
        let styleIndex = 0;
        let styleLoadAttempts = 0;
        const MAX_STYLE_ATTEMPTS = 3;

        // Create map instance with error handling for style loading
        const initMap = () => {
          try {
            // Create map with current style
            map.current = new mapboxgl.Map({
              container: mapContainer.current!,
              style: mapStyles[styleIndex],
              center: initialCenter,
              zoom: initialZoom,
              attributionControl: false,
              failIfMajorPerformanceCaveat: false,
              localIdeographFontFamily: "'Noto Sans Arabic', 'Noto Sans', sans-serif",
              maxZoom: 19,
              minZoom: 3,
              preserveDrawingBuffer: true,
            });

            // Add map controls
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
            map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

            // Handle style load errors
            map.current.on('style.load', () => {
              // Successfully loaded style
              console.log('Map style loaded successfully');
              styleLoadAttempts = 0; // Reset attempts counter
              
              toast({
                title: language === 'ar' ? 'مرحبًا بك في خريطة المحطات' : 'Welcome to the stations map',
                description: language === 'ar' ? 'يرجى اختيار مدينة لعرض المحطات' : 'Please select a city to view stations',
              });
            });

            // Handle general map errors
            map.current.on('error', (e) => {
              console.error('Map error:', e);
              
              // Check if it's a style loading error
              if (e.error && (
                  e.error.message?.includes('style') || 
                  e.error.message?.includes('StylesheetRoot') ||
                  e.error.message?.includes('cannot read')))
              {
                handleStyleLoadError();
              }
            });
          } catch (error) {
            console.error('Error initializing map:', error);
            handleStyleLoadError();
          }
        };

        // Function to handle style load errors
        const handleStyleLoadError = () => {
          styleLoadAttempts++;
          
          if (styleLoadAttempts >= MAX_STYLE_ATTEMPTS) {
            // Move to next style if available
            styleIndex = (styleIndex + 1) % mapStyles.length;
            styleLoadAttempts = 0;
            
            // Remove previous map instance if it exists
            if (map.current) {
              try {
                map.current.remove();
                map.current = null;
              } catch (e) {
                console.error('Error removing map during style switch:', e);
              }
            }
            
            // Try with another style
            console.log(`Trying next map style: ${mapStyles[styleIndex]}`);
            setTimeout(initMap, 100);
          } else if (styleLoadAttempts === MAX_STYLE_ATTEMPTS - 1) {
            // Last attempt - show warning to user
            toast({
              title: language === 'ar' ? 'مشكلة في تحميل الخريطة' : 'Map loading issue',
              description: language === 'ar' ? 'جاري محاولة استخدام نمط خريطة بديل' : 'Trying alternative map style',
            });
          }
        };

        // Start map initialization
        initMap();
        
      } catch (error) {
        console.error('Fatal error initializing map:', error);
        toast({
          title: language === 'ar' ? 'خطأ في تهيئة الخريطة' : 'Map initialization error',
          description: language === 'ar' ? 'حدث خطأ أثناء تحميل الخريطة' : 'An error occurred while loading the map',
          variant: 'destructive'
        });
      }
    }

    return () => {
      if (map.current) {
        try {
          // Cleanup all event listeners and resources
          map.current.remove();
          map.current = null;
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
    };
  }, [language, toast]);

  return { mapContainer, map };
};
