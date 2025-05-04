
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { useToast } from "@/hooks/use-toast";

export const useMapInitialization = (language: 'ar' | 'en') => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();

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

        // Create map instance
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: initialCenter,
          zoom: initialZoom,
          attributionControl: false,
        });

        // Add map controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

        // Add event listener when map loads
        map.current.on('load', () => {
          toast({
            title: language === 'ar' ? 'مرحبًا بك في خريطة المحطات' : 'Welcome to the stations map',
            description: language === 'ar' ? 'يرجى اختيار مدينة لعرض المحطات' : 'Please select a city to view stations',
          });
        });
        
        // Add error handling
        map.current.on('error', (e) => {
          console.error('Map error:', e);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
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
