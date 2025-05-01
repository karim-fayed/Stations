
import React, { useEffect, useState, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { GasStation } from '@/types/station';
import { fetchNearestStations } from '@/services/stationService';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";

// تهيئة Mapbox باستخدام المفتاح
mapboxgl.accessToken = MAPBOX_TOKEN;

interface InteractiveMapProps {
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
  stations: GasStation[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  selectedStation, 
  onSelectStation, 
  language,
  stations 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { toast } = useToast();
  
  // نصوص متعددة اللغات
  const texts = {
    getLocation: language === 'ar' ? 'تحديد موقعك' : 'Get Your Location',
    directions: language === 'ar' ? 'عرض الاتجاهات' : 'Show Directions',
    nearestStation: language === 'ar' ? 'أقرب محطة إليك' : 'Nearest Station',
    reset: language === 'ar' ? 'إعادة تعيين' : 'Reset',
    findNearest: language === 'ar' ? 'البحث عن أقرب محطة' : 'Find Nearest Station',
    locationDetecting: language === 'ar' ? 'جاري تحديد موقعك' : 'Detecting your location',
    pleaseWait: language === 'ar' ? 'يرجى الانتظار قليلاً...' : 'Please wait a moment...',
    locationDetected: language === 'ar' ? 'تم تحديد موقعك' : 'Location detected',
    nearestStationIs: language === 'ar' ? 'أقرب محطة إليك هي' : 'Your nearest station is',
    showingDirections: language === 'ar' ? 'جاري عرض الاتجاهات' : 'Showing Directions',
    directionsTo: language === 'ar' ? 'جاري عرض الاتجاهات إلى' : 'Showing directions to',
    meters: language === 'ar' ? 'متر' : 'meters',
    kilometers: language === 'ar' ? 'كم' : 'km',
    locationError: language === 'ar' ? 'خطأ في تحديد الموقع' : 'Location Error',
    enableLocation: language === 'ar' ? 'يرجى تفعيل خدمة تحديد الموقع' : 'Please enable location services',
  };

  // تحديث المُعلّمات (markers) على الخريطة
  const updateMarkers = () => {
    // حذف جميع المُعلّمات الموجودة
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // إذا لم تكن الخريطة جاهزة بعد، لا تفعل شيئًا
    if (!map.current) return;

    // إنشاء مُعلّم لكل محطة
    stations.forEach(station => {
      // إنشاء عنصر HTML للمُعلّمة
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = selectedStation?.id === station.id ? '#ff7733' : '#6633cc';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      el.style.transition = 'all 0.3s ease';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '12px';
      
      // إضافة رمز أو رقم للمُعلّمة
      el.textContent = station.id.substring(0, 1);
      
      // إضافة تأثير نبض للمُعلّمة المحددة
      if (selectedStation?.id === station.id) {
        el.style.animation = 'pulse 1.5s infinite';
      }

      // إنشاء مُعلّمة وإضافتها إلى الخريطة
      const marker = new mapboxgl.Marker(el)
        .setLngLat([station.longitude, station.latitude])
        .addTo(map.current!);

      // إضافة نافذة منبثقة (Popup) على النقر
      marker.getElement().addEventListener('click', () => {
        onSelectStation(station);
        
        // تحريك الخريطة إلى المُعلّمة المحددة
        map.current?.flyTo({
          center: [station.longitude, station.latitude],
          zoom: 14,
          essential: true,
          duration: 1000
        });
      });

      // تخزين المُعلّم في المرجع
      markersRef.current.push(marker);
    });
  };

  // تحديد موقع المستخدم
  const getUserLocation = () => {
    toast({
      title: texts.locationDetecting,
      description: texts.pleaseWait,
    });
    
    if (!navigator.geolocation) {
      toast({
        title: texts.locationError,
        description: texts.enableLocation,
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        // التحرك إلى موقع المستخدم
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          essential: true,
          duration: 1000
        });

        // إضافة مُعلّم لموقع المستخدم
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#4285F4';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        el.style.animation = 'pulse 1.5s infinite';

        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        try {
          // البحث عن أقرب محطات
          const nearestStations = await fetchNearestStations(latitude, longitude, 1);
          
          if (nearestStations.length > 0) {
            const nearest = nearestStations[0];
            onSelectStation(nearest);
            
            // تحويل المسافة من أمتار إلى كيلومترات إذا كانت أكبر من 1000 متر
            const distanceText = nearest.distance_meters && nearest.distance_meters > 1000 
              ? `${(nearest.distance_meters / 1000).toFixed(2)} ${texts.kilometers}` 
              : `${Math.round(nearest.distance_meters || 0)} ${texts.meters}`;
              
            toast({
              title: texts.locationDetected,
              description: `${texts.nearestStationIs} ${nearest.name} (${distanceText})`,
            });
          }
        } catch (error) {
          console.error('Error fetching nearest stations:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: texts.locationError,
          description: error.message,
          variant: 'destructive',
        });
      }
    );
  };

  // عرض الاتجاهات
  const showDirections = () => {
    if (!selectedStation) return;
    
    toast({
      title: texts.showingDirections,
      description: `${texts.directionsTo} ${selectedStation.name}`,
    });
    
    // فتح اتجاهات جوجل في نافذة جديدة
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`;
    window.open(url, '_blank');
  };

  // البحث عن أقرب محطة
  const findNearestStation = async () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }
    
    try {
      const nearestStations = await fetchNearestStations(userLocation.latitude, userLocation.longitude, 1);
      if (nearestStations.length > 0) {
        onSelectStation(nearestStations[0]);
        
        // تحريك الخريطة إلى المحطة
        map.current?.flyTo({
          center: [nearestStations[0].longitude, nearestStations[0].latitude],
          zoom: 14,
          essential: true,
          duration: 1000
        });
      }
    } catch (error) {
      console.error('Error finding nearest station:', error);
    }
  };

  // تهيئة الخريطة
  useEffect(() => {
    if (map.current) return; // تجنب إعادة التهيئة
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [44.1277, 17.4924], // إحداثيات افتراضية (نجران)
        zoom: 11,
        attributionControl: false,
      });

      // إضافة أدوات التحكم بالخريطة
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

      // حدث اكتمال تحميل الخريطة
      map.current.on('load', () => {
        updateMarkers();
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // تحديث المعلمات عند تغير المحطات أو المحطة المحددة
  useEffect(() => {
    updateMarkers();
  }, [stations, selectedStation]);

  // CSS للأنيميشن
  useEffect(() => {
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
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-grow">
        <div ref={mapContainer} className="map-container rounded-lg shadow-lg"></div>
        
        {selectedStation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-4 right-4 bottom-4 max-w-md mx-auto bg-white/90 backdrop-blur-sm"
          >
            <div className={`p-4 rounded-lg shadow-lg ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="font-bold text-noor-purple text-lg">{selectedStation.name}</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? `المنطقة: ${selectedStation.region}` : `Region: ${selectedStation.region}`}
              </p>
              {selectedStation.distance_meters && (
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? `المسافة: ${selectedStation.distance_meters > 1000 
                      ? `${(selectedStation.distance_meters/1000).toFixed(2)} كم` 
                      : `${Math.round(selectedStation.distance_meters)} متر`}`
                    : `Distance: ${selectedStation.distance_meters > 1000
                      ? `${(selectedStation.distance_meters/1000).toFixed(2)} km`
                      : `${Math.round(selectedStation.distance_meters)} meters`}`
                  }
                </p>
              )}
              {selectedStation.fuel_types && (
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? `أنواع الوقود: ${selectedStation.fuel_types}` : `Fuel Types: ${selectedStation.fuel_types}`}
                </p>
              )}
              <div className="mt-3 flex justify-between gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => onSelectStation(null)}
                >
                  {texts.reset}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-noor-orange text-white rounded-md hover:bg-noor-orange/90 transition-colors"
                  onClick={showDirections}
                >
                  {texts.directions}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-between">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-noor-purple text-white rounded-md hover:bg-noor-purple/90 transition-colors"
          onClick={getUserLocation}
        >
          {texts.getLocation}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 border border-noor-purple text-noor-purple rounded-md hover:bg-noor-purple/10 transition-colors"
          onClick={findNearestStation}
        >
          {texts.findNearest}
        </motion.button>
      </div>
    </div>
  );
};

export default InteractiveMap;
