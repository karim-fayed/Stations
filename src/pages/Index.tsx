
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import InteractiveMap from "@/components/InteractiveMap";
import GasStationList from "@/components/GasStationList";
import { GasStation } from "@/types/station";
import { fetchStations } from "@/services/stationService";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  // الحالات (States)
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [stations, setStations] = useState<GasStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('map');
  const locationInitializedRef = useRef<boolean>(false);
  const mapLoadErrorCount = useRef<number>(0);

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
        setError(t('home.loadingError'));
        toast({
          title: language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data',
          description: language === 'ar' ? 'حدث خطأ أثناء تحميل بيانات المحطات' : 'An error occurred while loading station data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, [language, t, toast]);

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

  // Handle map load error
  const handleMapLoadError = () => {
    mapLoadErrorCount.current += 1;
    
    if (mapLoadErrorCount.current > 2) {
      // After multiple failures, switch to list view
      setActiveTab('list');
      toast({
        title: language === 'ar' ? 'مشكلة في تحميل الخريطة' : 'Map loading problem',
        description: language === 'ar' ? 'تم تحويلك لقائمة المحطات' : 'Switched to stations list view',
        variant: 'destructive'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gray-50"
    >
      <Toaster />

      <div className="absolute top-4 right-4 z-10">
        <Link to="/admin/login">
          <Button variant="outline" className="flex items-center gap-2 bg-white/90 hover:bg-white shadow-sm border border-gray-200">
            <UserCircle size={18} />
            <span className="hidden sm:inline">{t('common.adminPanel')}</span>
          </Button>
        </Link>
      </div>

      <Header />

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 pb-2">
              <h2 className={`text-2xl font-bold mb-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-noor-purple`}>
                {language === 'ar' ? 'محطات الوقود القريبة' : 'Nearby Gas Stations'}
              </h2>
              <p className={`text-gray-600 mb-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' 
                  ? 'اختر المنطقة أو ابحث عن محطة الوقود لمعرفة التفاصيل والاتجاهات'
                  : 'Select a region or search for a gas station to see details and directions'}
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center m-6">
                {error}
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger 
                      value="map" 
                      className="data-[state=active]:bg-noor-purple data-[state=active]:text-white text-sm font-semibold py-2.5 transition-all duration-300"
                    >
                      {t('common.map')}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="list" 
                      className="data-[state=active]:bg-noor-purple data-[state=active]:text-white text-sm font-semibold py-2.5 transition-all duration-300"
                    >
                      {t('common.stationsList')}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="pb-6 px-6">
                  <TabsContent value="map" className="min-h-[500px] mt-0">
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                      <InteractiveMap
                        selectedStation={selectedStation}
                        onSelectStation={handleSelectStation}
                        language={language}
                        stations={stations}
                        initBackgroundLocation={!locationInitializedRef.current}
                        onLocationInitialized={() => {
                          locationInitializedRef.current = true;
                        }}
                        onMapLoadError={handleMapLoadError}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="list" className="mt-0">
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                      <GasStationList
                        stations={stations}
                        onSelectStation={handleSelectStation}
                        selectedStation={selectedStation}
                        language={language}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-noor-purple text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>
            {language === 'ar'
              ? '© 2025 محطات نور. جميع الحقوق محفوظة.'
              : '© 2025 Noor Stations. All rights reserved.'}
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default Index;
