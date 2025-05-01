
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import InteractiveMap from "@/components/InteractiveMap";
import GasStationList from "@/components/GasStationList";
import { GasStation } from "@/types/station";
import { fetchStations } from "@/services/stationService";
import { motion } from "framer-motion";

const Index = () => {
  // الحالات (States)
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar'); // Default to Arabic
  const [stations, setStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات المحطات عند تحميل الصفحة
  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchStations();
        setStations(data);
        setError(null);
      } catch (err) {
        console.error("Error loading stations:", err);
        setError(language === 'ar' 
          ? "حدث خطأ أثناء تحميل بيانات المحطات" 
          : "Error loading station data");
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, [language]);

  // تغيير اللغة
  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex flex-col ${language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      <Toaster />
      
      <Header language={language} onChangeLanguage={handleLanguageChange} />
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="map">
                {language === 'ar' ? 'الخريطة' : 'Map'}
              </TabsTrigger>
              <TabsTrigger value="list">
                {language === 'ar' ? 'قائمة المحطات' : 'Stations List'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="min-h-[500px]">
              <InteractiveMap 
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
                language={language}
                stations={stations}
              />
            </TabsContent>
            
            <TabsContent value="list">
              <GasStationList 
                stations={stations}
                onSelectStation={setSelectedStation}
                selectedStation={selectedStation}
                language={language}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <footer className={`bg-noor-purple text-white p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
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
