import React, { useEffect, useState, useRef, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { GasStation } from '@/types/station';
import { fetchNearestStations } from '@/services/stationService';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// تهيئة Mapbox باستخدام المفتاح
mapboxgl.accessToken = MAPBOX_TOKEN;

// قائمة المدن الرئيسية في المملكة العربية السعودية مع إحداثياتها
const saudiCities = [
  { name: 'الرياض', nameEn: 'Riyadh', latitude: 24.7136, longitude: 46.6753, zoom: 10 },
  { name: 'جدة', nameEn: 'Jeddah', latitude: 21.4858, longitude: 39.1925, zoom: 10 },
  { name: 'مكة المكرمة', nameEn: 'Mecca', latitude: 21.3891, longitude: 39.8579, zoom: 10 },
  { name: 'المدينة المنورة', nameEn: 'Medina', latitude: 24.5247, longitude: 39.5692, zoom: 10 },
  { name: 'الدمام', nameEn: 'Dammam', latitude: 26.4207, longitude: 50.0888, zoom: 10 },
  { name: 'الخبر', nameEn: 'Khobar', latitude: 26.2172, longitude: 50.1971, zoom: 10 },
  { name: 'تبوك', nameEn: 'Tabuk', latitude: 28.3998, longitude: 36.5717, zoom: 10 },
  { name: 'نجران', nameEn: 'Najran', latitude: 17.4924, longitude: 44.1277, zoom: 10 },
];

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
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingNearest, setIsLoadingNearest] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('الرياض'); // الرياض كمدينة افتراضية
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
    fuelTypes: language === 'ar' ? 'أنواع الوقود:' : 'Fuel Types:',
    region: language === 'ar' ? 'المنطقة:' : 'Region:',
    subRegion: language === 'ar' ? 'الموقع:' : 'Location:',
    distance: language === 'ar' ? 'المسافة:' : 'Distance:',
    name: language === 'ar' ? 'الاسم:' : 'Name:',
    clickForDetails: language === 'ar' ? 'اضغط للتفاصيل' : 'Click for details',
    selectCity: language === 'ar' ? 'اختر مدينة' : 'Select City',
  };

  // إنشاء محتوى النافذة المنبثقة (Popup) للمحطة
  const createPopupContent = (station: GasStation) => {
    const distance = station.distance_meters 
      ? station.distance_meters > 1000 
        ? `${(station.distance_meters / 1000).toFixed(2)} ${texts.kilometers}` 
        : `${Math.round(station.distance_meters)} ${texts.meters}`
      : null;
    
    const content = document.createElement('div');
    content.className = 'px-2 py-1';
    content.dir = language === 'ar' ? 'rtl' : 'ltr'; // إضافة اتجاه النص حسب اللغة
    content.innerHTML = `
      <div class="font-bold text-noor-purple">${station.name}</div>
      <div class="text-xs text-gray-600">${texts.region} ${station.region}</div>
      <div class="text-xs text-gray-600">${texts.subRegion} ${station.sub_region}</div>
      ${station.fuel_types ? `<div class="text-xs text-gray-600">${texts.fuelTypes} ${station.fuel_types}</div>` : ''}
      ${distance ? `<div class="text-xs text-gray-600">${texts.distance} ${distance}</div>` : ''}
      <button class="mt-2 px-2 py-1 text-xs bg-noor-purple text-white rounded hover:bg-noor-purple/90 transition-all">${texts.clickForDetails}</button>
    `;

    // إضافة حدث النقر لزر التفاصيل
    const button = content.querySelector('button');
    if (button) {
      button.addEventListener('click', () => {
        onSelectStation(station);
      });
    }

    return content;
  };

  // تحديث المُعلّمات (markers) على الخريطة
  const updateMarkers = useCallback(() => {
    // حذف جميع المُعلّمات والنوافذ المنبثقة الموجودة
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];

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
        
        // تمرير الخريطة إلى المحطة المحددة
        map.current.flyTo({
          center: [station.longitude, station.latitude],
          zoom: 14,
          essential: true,
          duration: 1000
        });
      }

      // إنشاء popup للمحطة
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
      }).setDOMContent(createPopupContent(station));
      
      popupsRef.current.push(popup);

      // إنشاء مُعلّم وإضافتها إلى الخريطة
      const marker = new mapboxgl.Marker(el)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // إضافة أحداث hover
      el.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });
      
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // إضافة حدث النقر
      el.addEventListener('click', () => {
        onSelectStation(station);
      });

      // تخزين المُعلّم في المرجع
      markersRef.current.push(marker);
    });
  }, [stations, selectedStation, onSelectStation, language]);

  // تحديد موقع المستخدم
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    
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
      setIsLoadingLocation(false);
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

        // حذف مؤشر المستخدم الحالي إذا وجد
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

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

        userMarkerRef.current = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        setIsLoadingLocation(false);

        toast({
          title: texts.locationDetected,
          description: texts.pleaseWait,
        });

        // تلقائيًا ابحث عن أقرب محطة
        findNearestStation();
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: texts.locationError,
          description: error.message,
          variant: 'destructive',
        });
        setIsLoadingLocation(false);
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
    
    setIsLoadingNearest(true);
    
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
        
        // تحويل المسافة من أمتار إلى كيلومترات إذا كانت أكبر من 1000 متر
        const distanceText = nearestStations[0].distance_meters && nearestStations[0].distance_meters > 1000 
          ? `${(nearestStations[0].distance_meters / 1000).toFixed(2)} ${texts.kilometers}` 
          : `${Math.round(nearestStations[0].distance_meters || 0)} ${texts.meters}`;
            
        toast({
          title: texts.locationDetected,
          description: `${texts.nearestStationIs} ${nearestStations[0].name} (${distanceText})`,
        });
      }
    } catch (error) {
      console.error('Error finding nearest station:', error);
      toast({
        title: texts.locationError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNearest(false);
    }
  };

  // التغيير إلى مدينة مختارة
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const city = saudiCities.find(city => city.name === cityName || city.nameEn === cityName);
    
    if (city && map.current) {
      // تحريك الخريطة إلى المدينة المختارة
      map.current.flyTo({
        center: [city.longitude, city.latitude],
        zoom: city.zoom,
        essential: true,
        duration: 1500
      });
      
      // يمكن هنا إضافة منطق لتصفية المحطات حسب المدينة المختارة
      toast({
        title: language === 'ar' ? `تم الانتقال إلى ${city.name}` : `Moved to ${city.nameEn}`,
        description: language === 'ar' ? 'تم عرض المحطات في المنطقة المختارة' : 'Showing stations in the selected area',
      });
    }
  };

  // تهيئة الخريطة
  useEffect(() => {
    if (map.current) return; // تجنب إعادة التهيئة
    
    if (mapContainer.current) {
      // البحث عن مدينة الرياض في قائمة المدن
      const riyadh = saudiCities.find(city => city.name === 'الرياض' || city.nameEn === 'Riyadh');
      // Fix: Ensure initialCenter is an array with two values [longitude, latitude]
      const initialCenter: [number, number] = riyadh ? [riyadh.longitude, riyadh.latitude] : [46.6753, 24.7136]; 
      const initialZoom = riyadh?.zoom || 10;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter, 
        zoom: initialZoom,
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
  }, [stations, selectedStation, updateMarkers]);

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
      {/* قائمة المدن المنسدلة */}
      <div className={`mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        <Select 
          value={selectedCity} 
          onValueChange={handleCityChange}
          dir={language === 'ar' ? 'rtl' : 'ltr'} // توجيه القائمة حسب اللغة
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={texts.selectCity} />
          </SelectTrigger>
          <SelectContent dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {saudiCities.map((city) => (
              <SelectItem key={city.nameEn} value={city.name}>
                {language === 'ar' ? city.name : city.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative flex-grow">
        <div ref={mapContainer} className="map-container h-[500px] rounded-lg shadow-lg"></div>
        
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
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? `الموقع: ${selectedStation.sub_region}` : `Location: ${selectedStation.sub_region}`}
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
          className="px-4 py-2 bg-noor-purple text-white rounded-md hover:bg-noor-purple/90 transition-colors flex items-center justify-center"
          onClick={getUserLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </>
          ) : texts.getLocation}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 border border-noor-purple text-noor-purple rounded-md hover:bg-noor-purple/10 transition-colors flex items-center justify-center"
          onClick={findNearestStation}
          disabled={isLoadingNearest || !userLocation}
        >
          {isLoadingNearest ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
            </>
          ) : texts.findNearest}
        </motion.button>
      </div>
    </div>
  );
};

export default InteractiveMap;
