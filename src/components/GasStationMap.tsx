
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

interface GasStationMapProps {
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation) => void;
  language: 'ar' | 'en';
}

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

const GasStationMap: React.FC<GasStationMapProps> = ({ 
  selectedStation,
  onSelectStation,
  language
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  
  const getLocationText = useCallback(() => {
    return language === 'ar' ? 'نتعرف بتواجدك' : 'Detect Your Location';
  }, [language]);
  
  const getDirectionsText = useCallback(() => {
    return language === 'ar' ? 'عرض الاتجاهات' : 'Show Directions';
  }, [language]);
  
  const getNearestStationText = useCallback(() => {
    return language === 'ar' ? 'أقرب محطة إليك' : 'Nearest Station';
  }, [language]);
  
  const getResetText = useCallback(() => {
    return language === 'ar' ? 'إعادة تعيين' : 'Reset';
  }, [language]);
  
  const getShowNearestText = useCallback(() => {
    return language === 'ar' ? 'عرض أقرب محطة' : 'Show Nearest Station';
  }, [language]);

  // Simulate getting user location
  const getUserLocation = useCallback(() => {
    // In a real application, this would use the browser's geolocation API
    toast({
      title: language === 'ar' ? 'جاري تحديد موقعك' : 'Detecting your location',
      description: language === 'ar' ? 'يرجى الانتظار قليلاً...' : 'Please wait a moment...'
    });
    
    // Mock getting location after a delay
    setTimeout(() => {
      // These would be the user's actual coordinates in a real app
      setUserCoords({ lat: 17.4924, lng: 44.1277 });
      
      // Find nearest station (in a real app, you'd calculate this based on actual coordinates)
      const nearest = mockStations[0];
      onSelectStation(nearest);
      
      toast({
        title: language === 'ar' ? 'تم تحديد موقعك' : 'Location detected',
        description: language === 'ar' 
          ? `أقرب محطة إليك هي ${nearest.name} (${nearest.distance} كم)`
          : `Your nearest station is ${nearest.name} (${nearest.distance} km)`
      });
    }, 1500);
  }, [language, onSelectStation, toast]);

  // Placeholder function for the directions button
  const showDirections = useCallback(() => {
    if (!selectedStation) return;
    
    toast({
      title: language === 'ar' ? 'عرض الاتجاهات' : 'Showing Directions',
      description: language === 'ar' 
        ? `جاري عرض الاتجاهات إلى ${selectedStation.name}`
        : `Showing directions to ${selectedStation.name}`
    });
    
    // In a real app, this would open directions in a map
  }, [language, selectedStation, toast]);

  // This would be replaced with actual map initialization code in a real application
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Here we'd normally initialize a map like Google Maps, Mapbox, etc.
    const mapElement = mapRef.current;
    mapElement.innerHTML = '';
    
    // Create a placeholder map UI
    const mapPlaceholder = document.createElement('div');
    mapPlaceholder.className = 'relative w-full h-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden';
    
    // Create a background image element to simulate the map
    const mapBackground = document.createElement('img');
    mapBackground.src = '/lovable-uploads/6dc1b22d-a4de-46f6-8088-0bb3d66411ab.png';
    mapBackground.className = 'absolute inset-0 w-full h-full object-cover opacity-30';
    mapPlaceholder.appendChild(mapBackground);
    
    // Add text overlay to indicate this is a placeholder
    const mapText = document.createElement('div');
    mapText.className = 'absolute z-10 bg-white/80 p-3 rounded-md text-center';
    mapText.textContent = language === 'ar' 
      ? 'خريطة تفاعلية ستظهر هنا' 
      : 'Interactive map would be displayed here';
    mapPlaceholder.appendChild(mapText);
    
    // Add station markers
    mockStations.forEach(station => {
      const marker = document.createElement('div');
      marker.className = `absolute z-20 w-6 h-6 rounded-full bg-noor-purple flex items-center justify-center 
                         text-white text-xs font-bold cursor-pointer ${
                           selectedStation?.id === station.id ? 'ring-4 ring-noor-orange animate-pulse-light' : ''
                         }`;
      
      // Position randomly for demo purposes
      const top = 20 + Math.random() * 60;
      const left = 20 + Math.random() * 60;
      marker.style.top = `${top}%`;
      marker.style.left = `${left}%`;
      
      marker.textContent = station.id;
      marker.onclick = () => onSelectStation(station);
      
      mapPlaceholder.appendChild(marker);
    });
    
    mapElement.appendChild(mapPlaceholder);
    
    return () => {
      // Cleanup function would normally remove map listeners
    };
  }, [language, onSelectStation, selectedStation]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-grow">
        <div ref={mapRef} className="map-container rounded-lg shadow-lg"></div>
        
        {selectedStation && (
          <Card className="absolute left-4 right-4 bottom-4 max-w-md mx-auto bg-white/90 backdrop-blur-sm">
            <CardHeader className={`pb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <CardTitle>{getNearestStationText()}</CardTitle>
            </CardHeader>
            <CardContent className={language === 'ar' ? 'text-right' : 'text-left'}>
              <h3 className="font-bold text-noor-purple">{selectedStation.name}</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? `المسافة: ${selectedStation.distance} كم` : `Distance: ${selectedStation.distance} km`}
              </p>
              <div className="mt-3 flex justify-between gap-2">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => onSelectStation(null)}
                >
                  {getResetText()}
                </Button>
                <Button 
                  className="flex-1 bg-noor-orange hover:bg-noor-orange/90"
                  onClick={showDirections}
                >
                  {getDirectionsText()}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-between">
        <Button 
          className="bg-noor-purple hover:bg-noor-purple/90"
          onClick={getUserLocation}
        >
          {getLocationText()}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            // Find nearest station (hardcoded for demo)
            onSelectStation(mockStations[0]);
          }}
        >
          {getShowNearestText()}
        </Button>
      </div>
    </div>
  );
};

export default GasStationMap;
