
import React, { useEffect, useState, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { GasStation } from '@/types/station';
import { fetchNearestStations } from '@/services/stationService';
import { useToast } from "@/hooks/use-toast";

// Import modular components
import CitySelector from './map/CitySelector';
import MapControls from './map/MapControls';
import StationPopup from './map/StationPopup';
import MapMarkerManager from './map/MapMarkerManager';
import UserLocationMarker from './map/UserLocationMarker';
import MapAnimation from './map/MapAnimation';

// Import hooks
import { useMapLocalization } from './map/useMapLocalization';
import { useSaudiCities } from './map/useSaudiCities';

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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingNearest, setIsLoadingNearest] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('الرياض'); // الرياض كمدينة افتراضية
  const { toast } = useToast();
  
  // Load custom hooks
  const texts = useMapLocalization(language);
  const saudiCities = useSaudiCities();

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
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* City Selector Component */}
      <CitySelector 
        cities={saudiCities}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        language={language}
      />
      
      <div className="relative flex-grow">
        <div ref={mapContainer} className="map-container h-[500px] rounded-lg shadow-lg"></div>
        
        {/* Station Popup Component - Only show when a station is selected */}
        {selectedStation && (
          <StationPopup 
            station={selectedStation}
            onSelectStation={onSelectStation}
            language={language}
            texts={texts}
            onShowDirections={showDirections}
          />
        )}
      </div>
      
      {/* Map Controls Component */}
      <MapControls 
        onGetLocation={getUserLocation}
        onFindNearest={findNearestStation}
        isLoadingLocation={isLoadingLocation}
        isLoadingNearest={isLoadingNearest}
        hasUserLocation={!!userLocation}
        texts={texts}
        language={language}
      />
      
      {/* Hidden marker management components */}
      <MapMarkerManager
        map={map.current}
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={onSelectStation}
        language={language}
        createPopupContent={createPopupContent}
      />
      
      <UserLocationMarker
        map={map.current}
        userLocation={userLocation}
      />
      
      <MapAnimation enable={true} />
    </div>
  );
};

export default InteractiveMap;
