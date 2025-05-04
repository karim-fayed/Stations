
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { useToast } from "@/hooks/use-toast";

export const useMapInitialization = (language: 'ar' | 'en') => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();
  const [tokenError, setTokenError] = useState<boolean>(!MAPBOX_TOKEN);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  
  // List of alternative map styles to try if the primary one fails
  const mapStyles = [
    'mapbox://styles/mapbox/streets-v12',
    'mapbox://styles/mapbox/light-v11',
    'mapbox://styles/mapbox/dark-v11',
    'mapbox://styles/mapbox/outdoors-v12'
  ];

  // Function to initialize map
  const initializeMap = () => {
    const currentToken = localStorage.getItem('MAPBOX_TOKEN') || MAPBOX_TOKEN;
    
    // Check if we have a token now
    if (!currentToken) {
      console.error('Mapbox token is not defined');
      setTokenError(true);
      toast({
        title: language === 'ar' ? 'خطأ في تهيئة الخريطة' : 'Map initialization error',
        description: language === 'ar' ? 'يرجى إدخال رمز Mapbox' : 'Please enter a Mapbox token',
        variant: 'destructive'
      });
      return;
    }

    // We have a token, try to initialize map
    if (map.current || !mapContainer.current) return;

    try {
      // Set mapbox token
      mapboxgl.accessToken = currentToken;

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
          console.log('Initializing map with token', currentToken.substring(0, 5) + '...');
          
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
            setMapInitialized(true);
            setTokenError(false);
            
            toast({
              title: language === 'ar' ? 'مرحبًا بك في خريطة المحطات' : 'Welcome to the stations map',
              description: language === 'ar' ? 'يرجى اختيار مدينة لعرض المحطات' : 'Please select a city to view stations',
            });
          });

          // Handle general map errors
          map.current.on('error', (e) => {
            console.error('Map error:', e);
            
            // Check if it's an authentication error
            if (e.error && (
              e.error.message?.includes('accessToken') || 
              e.error.message?.includes('401')
            )) {
              console.error('Authentication error with Mapbox token');
              setTokenError(true);
              if (map.current) {
                map.current.remove();
                map.current = null;
              }
              return;
            }
            
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
          
          // Check if it's a token error
          if (error instanceof Error && 
              (error.message.includes('accessToken') || 
               error.message.includes('401') || 
               error.message.toLowerCase().includes('unauthorized'))) {
            console.error('Invalid Mapbox token');
            setTokenError(true);
            return;
          }
          
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
  };

  // Initialize map when component mounts or if token is updated
  useEffect(() => {
    initializeMap();
    
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
  }, [language]); // Reinitialize if language changes

  // Function to refresh map with new token
  const refreshWithNewToken = () => {
    if (map.current) {
      try {
        map.current.remove();
        map.current = null;
      } catch (error) {
        console.error('Error removing map during refresh:', error);
      }
    }
    
    setTokenError(false);
    setTimeout(initializeMap, 100);
  };

  return { mapContainer, map, tokenError, refreshWithNewToken, mapInitialized };
};
