import React, { useEffect, useState, useRef, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { GasStation } from '@/types/station';
import { fetchNearestStations } from '@/services/stationService';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  const [selectedCity, setSelectedCity] = useState<string>(''); // Empty city as default
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [filteredStations, setFilteredStations] = useState<GasStation[]>([]);
  const { toast } = useToast();

  // Load custom hooks
  const texts = useMapLocalization(language);
  const { cities, isLoading: citiesLoading } = useSaudiCities();

  // تأخير البحث لتجنب التحديث المستمر أثناء الكتابة
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // تأخير 300 مللي ثانية

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // تحديث المحطات المفلترة عند تغيير مصطلح البحث
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      // If no search term, respect the city filter
      if (selectedCity) {
        filterStationsByCity(selectedCity);
      } else {
        // Start with empty filtered stations
        setFilteredStations([]);
      }
      return;
    }

    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      station.region?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      station.sub_region?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (station.fuel_types && station.fuel_types.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );

    setFilteredStations(filtered);

    // التوجيه إلى المحطة أو المدينة عند البحث
    if (filtered.length > 0 && map.current) {
      // البحث عن مدينة مطابقة أولاً
      const matchingCity = cities.find(city =>
        city.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        city.nameEn.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );

      if (matchingCity) {
        // إذا وجدنا مدينة مطابقة، ننتقل إليها
        map.current.flyTo({
          center: [matchingCity.longitude, matchingCity.latitude],
          zoom: matchingCity.zoom,
          essential: true,
          duration: 1000
        });

        // تحديث المدينة المختارة في القائمة المنسدلة
        setSelectedCity(matchingCity.name);
      } else {
        // إذا لم نجد مدينة مطابقة، ننتقل إلى أول محطة في النتائج
        const firstStation = filtered[0];
        map.current.flyTo({
          center: [firstStation.longitude, firstStation.latitude],
          zoom: 14,
          essential: true,
          duration: 1000
        });

        // تحديد المحطة
        onSelectStation(firstStation);
      }
    }
  }, [debouncedSearchTerm, stations, cities, onSelectStation]);

  // Function to filter stations by city name
  const filterStationsByCity = (cityName: string) => {
    try {
      if (!cityName || cityName === '') {
        // If no city is selected, return empty list to avoid showing all stations at once
        setFilteredStations([]);
        return;
      }

      const city = cities.find(c => c.name === cityName || c.nameEn === cityName);
      
      if (!city) {
        throw new Error(`City ${cityName} not found`);
      }

      // Find all stations in the selected city
      const cityStations = stations.filter(station => {
        // Check if station's region matches the city name
        return station.region === city.name || station.region === city.nameEn;
      });

      // If no exact matches found, try by proximity
      if (cityStations.length === 0) {
        // Calculate distance to the city center for each station
        const stationsWithDistance = stations.map(station => {
          const distance = calculateDistance(
            station.latitude,
            station.longitude,
            city.latitude,
            city.longitude
          );
          return { ...station, distanceFromCity: distance };
        });

        // Get stations within 50km of the city center
        const nearbyStations = stationsWithDistance
          .filter(station => station.distanceFromCity <= 50)
          .sort((a, b) => (a.distanceFromCity || 0) - (b.distanceFromCity || 0));

        setFilteredStations(nearbyStations);
        toast({
          title: language === 'ar' ? `تم الانتقال إلى ${city.name}` : `Moved to ${city.nameEn}`,
          description: language === 'ar'
            ? `تم العثور على ${nearbyStations.length} محطة بالقرب من المدينة`
            : `Found ${nearbyStations.length} stations near the city`,
        });
      } else {
        setFilteredStations(cityStations);
        toast({
          title: language === 'ar' ? `تم الانتقال إلى ${city.name}` : `Moved to ${city.nameEn}`,
          description: language === 'ar'
            ? `تم العثور على ${cityStations.length} محطة في المدينة`
            : `Found ${cityStations.length} stations in the city`,
        });
      }

      // Move map to the selected city
      if (map.current && city) {
        map.current.flyTo({
          center: [city.longitude, city.latitude],
          zoom: city.zoom,
          essential: true,
          duration: 1500
        });
      }
    } catch (error) {
      console.error("Error filtering stations by city:", error);
      setFilteredStations([]);
      toast({
        title: language === 'ar' ? 'خطأ في تصفية المحطات' : 'Error filtering stations',
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    }
  };

  // إنشاء محتوى النافذة المنبثقة (Popup) للمحطة
  const createPopupContent = (station: GasStation) => {
    const distance = station.distance_meters
      ? station.distance_meters > 1000
        ? `${(station.distance_meters / 1000).toFixed(2)} ${texts.kilometers}`
        : `${Math.round(station.distance_meters)} ${texts.meters}`
      : null;

    const content = document.createElement('div');
    content.className = 'px-3 py-2';
    content.dir = language === 'ar' ? 'rtl' : 'ltr'; // إضافة اتجاه النص حسب اللغة
    content.innerHTML = `
      <div class="bg-gradient-to-r from-noor-purple to-noor-light-purple p-2 -mt-2 -mx-3 mb-2 rounded-t-lg">
        <div class="font-bold text-white text-center">${station.name}</div>
      </div>
      <div class="grid grid-cols-2 gap-1 text-center mb-2">
        <div class="text-xs font-medium text-noor-purple">${texts.region}:</div>
        <div class="text-xs text-gray-700">${station.region}</div>

        <div class="text-xs font-medium text-noor-purple">${texts.subRegion}:</div>
        <div class="text-xs text-gray-700">${station.sub_region}</div>

        ${station.fuel_types ? `
        <div class="text-xs font-medium text-noor-purple">${texts.fuelTypes}:</div>
        <div class="text-xs text-gray-700">${station.fuel_types}</div>
        ` : ''}

        ${distance ? `
        <div class="text-xs font-medium text-noor-purple">${texts.distance}:</div>
        <div class="text-xs text-gray-700">${distance}</div>
        ` : ''}
      </div>
      <button class="w-full mt-1 px-2 py-1.5 text-xs bg-noor-orange text-white rounded hover:bg-noor-orange/90 transition-all font-medium">${texts.clickForDetails}</button>
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
    filterStationsByCity(cityName);
  };

  // دالة لحساب المسافة بين نقطتين جغرافيتين (بالكيلومترات)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // نصف قطر الأرض بالكيلومترات
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // المسافة بالكيلومترات
    return distance;
  }, []);

  // دالة إعادة تعيين الخريطة بالكامل
  const resetMap = useCallback(() => {
    // إلغاء تحديد المحطة
    onSelectStation(null);

    // إعادة تعيين حقل البحث
    setSearchTerm('');
    setDebouncedSearchTerm('');

    // إعادة تعيين موقع المستخدم
    setUserLocation(null);

    // إعادة تعيين المدينة
    setSelectedCity('');
    
    // Clear filtered stations
    setFilteredStations([]);

    // إعادة تعيين الخريطة إلى الموقع الافتراضي (السعودية)
    if (map.current) {
      // Center on Saudi Arabia
      map.current.flyTo({
        center: [45.079, 23.885], // Center of Saudi Arabia
        zoom: 5,
        essential: true,
        duration: 1500
      });

      toast({
        title: language === 'ar' ? 'تم إعادة تعيين الخريطة' : 'Map has been reset',
        description: language === 'ar' ? 'يمكنك اختيار مدينة لعرض المحطات فيها' : 'Choose a city to view its stations',
      });
    }
  }, [onSelectStation, language, toast]);

  // تهيئة الخريطة
  useEffect(() => {
    if (map.current) return; // تجنب إعادة التهيئة

    if (mapContainer.current) {
      // Center initially on Saudi Arabia
      const initialCenter: [number, number] = [45.079, 23.885]; // Center of Saudi Arabia
      const initialZoom = 5;

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

      // إضافة حدث عند اكتمال تحميل الخريطة
      map.current.on('load', () => {
        // Start with empty filters
        setSelectedCity('');
        setFilteredStations([]);
        
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
  }, [language]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        {/* City Selector Component */}
        <div className="flex-1">
          <CitySelector
            cities={cities}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
            language={language}
          />
        </div>

        {/* Search Field */}
        <div className="relative flex-1">
          <Input
            className="w-full pl-10"
            placeholder={texts.searchStation}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          {/* Search Results Count */}
          {searchTerm && (
            <div className="mt-1 text-xs text-muted-foreground">
              {searchTerm !== debouncedSearchTerm ? (
                <span className="animate-pulse">{language === 'ar' ? 'جاري البحث...' : 'Searching...'}</span>
              ) : filteredStations.length > 0 ? (
                `${texts.searchResults}: ${filteredStations.length}`
              ) : (
                texts.noResults
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-grow">
        <div ref={mapContainer} className="map-container h-[500px] rounded-lg shadow-lg"></div>

        {/* Show "Select a city" message when no city is selected */}
        {!selectedCity && filteredStations.length === 0 && !isLoadingLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold text-noor-purple mb-2">
              {language === 'ar' ? 'اختر مدينة' : 'Select a City'}
            </h3>
            <p className="text-gray-700 mb-4">
              {language === 'ar' 
                ? 'يرجى اختيار مدينة من القائمة المنسدلة لعرض المحطات' 
                : 'Please select a city from the dropdown to view stations'}
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {(isLoadingLocation || isLoadingNearest) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple mb-4"></div>
              <p className="text-noor-purple font-bold">
                {isLoadingLocation 
                  ? (language === 'ar' ? 'جاري تحديد موقعك...' : 'Detecting your location...')
                  : (language === 'ar' ? 'جاري البحث عن أقرب محطة...' : 'Finding nearest station...')}
              </p>
            </div>
          </div>
        )}

        {/* Station Popup Component - Only show when a station is selected */}
        {selectedStation && (
          <StationPopup
            station={selectedStation}
            onSelectStation={onSelectStation}
            language={language}
            texts={texts}
            onShowDirections={showDirections}
            onReset={resetMap}
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
        stations={filteredStations}
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
