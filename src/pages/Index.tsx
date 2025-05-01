
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import GasStationMap from "@/components/GasStationMap";
import GasStationList from "@/components/GasStationList";

// Define our gas station type
interface GasStation {
  id: string;
  name: string;
  area: string;
  location: string;
  distance: number; // in km
  distanceFromCenter: number; // in km
  latitude: number;
  longitude: number;
}

// Mock data for gas stations
const mockStations: GasStation[] = [
  {
    id: '1',
    name: 'محطة العريسة',
    area: 'نجران Najran',
    location: 'العريسة',
    distance: 0.36,
    distanceFromCenter: 21.50,
    latitude: 17.4930,
    longitude: 44.1090
  },
  {
    id: '2',
    name: 'محطة الفقعة',
    area: 'نجران Najran',
    location: 'الفقعة',
    distance: 1.2,
    distanceFromCenter: 17.11,
    latitude: 17.5025,
    longitude: 44.1274
  },
  {
    id: '3',
    name: 'محطة مكة',
    area: 'نجران Najran',
    location: 'مكة',
    distance: 2.5,
    distanceFromCenter: 11.30,
    latitude: 17.5419,
    longitude: 44.1871
  },
  {
    id: '4',
    name: 'محطة حوبا',
    area: 'نجران Najran',
    location: 'حوبا',
    distance: 4.1,
    distanceFromCenter: 28.97,
    latitude: 17.4702,
    longitude: 44.0583
  },
  {
    id: '5',
    name: 'محطة حي الضباط',
    area: 'نجران Najran',
    location: 'حي الضباط',
    distance: 5.3,
    distanceFromCenter: 11.08,
    latitude: 17.5611,
    longitude: 44.2201
  }
];

const Index = () => {
  // State for selected station and language
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar'); // Default to Arabic

  // Handle language change
  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
  };

  return (
    <div className={`min-h-screen flex flex-col ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Toaster />
      
      <Header language={language} onChangeLanguage={handleLanguageChange} />
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
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
            <GasStationMap 
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
              language={language}
            />
          </TabsContent>
          
          <TabsContent value="list">
            <GasStationList 
              stations={mockStations}
              onSelectStation={setSelectedStation}
              selectedStation={selectedStation}
              language={language}
            />
          </TabsContent>
        </Tabs>
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
    </div>
  );
};

export default Index;
