
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

    if (mapContainer.current) {
      // Center initially on Saudi Arabia
      const initialCenter: [number, number] = [45.079, 23.885]; // Center of Saudi Arabia
      const initialZoom = 5;

      // Set Mapbox token
      mapboxgl.accessToken = MAPBOX_TOKEN;

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
