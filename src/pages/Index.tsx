
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import InteractiveMap from "@/components/InteractiveMap";
import GasStationList from "@/components/GasStationList";
import { GasStation } from "@/types/station";
import { fetchStations } from "@/services/stationService";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/environment';
import { Language } from "@/i18n/translations";

const Index = () => {
  // الحالات (States)
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const { language, t } = useLanguage();
  const [stations, setStations] = useState<GasStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('map');
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const locationInitializedRef = useRef<boolean>(false);

  // بدء تحديد الموقع في الخلفية عند تحميل التطبيق
  useEffect(() => {
    // نهيئ mapboxgl قبل تحميل الخريطة
    mapboxgl.accessToken = MAPBOX_TOKEN;
  }, []);

  // جلب بيانات المحطات عند تحميل الصفحة
  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStations();
        setStations(data);
        // Start with empty filtered stations instead of showing all
        setFilteredStations([]);
        setError(null);
      } catch (err) {
        console.error("Error loading stations:", err);
        setError(t('home', 'loadingError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, [language, t]);

  // تغيير المحطة المحددة
  const handleSelectStation = (station: GasStation | null) => {
    setSelectedStation(station);
    // إذا تم تحديد محطة، انتقل إلى علامة التبويب "map"
    if (station) {
      setActiveTab('map');
    }
  };

  // تغيير المنطقة المحددة
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const isRTL = language === Language.ARABIC;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >
      <Toaster />

      {/* Remove the duplicate admin button from here, it's already in the Header */}

      <Header />

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center">
            {error}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4">
              <TabsTrigger value="map" className="text-sm sm:text-base py-1.5 sm:py-2">
                {t('home', 'map')}
              </TabsTrigger>
              <TabsTrigger value="list" className="text-sm sm:text-base py-1.5 sm:py-2">
                {t('home', 'stationsList')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="h-[70vh] sm:h-[75vh]">
              <InteractiveMap
                selectedStation={selectedStation}
                onSelectStation={handleSelectStation}
                language={language}
                stations={stations}
                initBackgroundLocation={!locationInitializedRef.current}
                onLocationInitialized={() => {
                  locationInitializedRef.current = true;
                }}
              />
            </TabsContent>

            <TabsContent value="list" className="h-[70vh] sm:h-[75vh] overflow-auto">
              <GasStationList
                stations={stations}
                onSelectStation={handleSelectStation}
                selectedStation={selectedStation}
                language={language}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className={`bg-noor-purple text-white py-2 mt-auto`}>
        <div className="container mx-auto text-center">
          <p className="text-xs sm:text-sm">
            {isRTL
              ? '© 2025 محطات نور. جميع الحقوق محفوظة.'
              : '© 2025 Noor Stations. All rights reserved.'}
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default Index;
