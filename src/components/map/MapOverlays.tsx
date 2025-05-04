
import React, { useState, useEffect } from 'react';

interface MapOverlaysProps {
  isLoadingLocation: boolean;
  isLoadingNearest: boolean;
  selectedCity: string;
  filteredStations: any[];
  language: 'ar' | 'en';
  isLoadingCity?: boolean;
}

const MapOverlays: React.FC<MapOverlaysProps> = ({
  isLoadingLocation,
  isLoadingNearest,
  selectedCity,
  filteredStations,
  language,
  isLoadingCity = false
}) => {
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  
  // Hide the initial message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialMessage(false);
    }, 5000);
    
    // Clean up timer when component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Show "Select a city" message when no city is selected, but hide after 5 seconds */}
      {!selectedCity && filteredStations.length === 0 && !isLoadingLocation && !isLoadingCity && showInitialMessage && (
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
      {(isLoadingLocation || isLoadingNearest || isLoadingCity) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple mb-4"></div>
            <p className="text-noor-purple font-bold">
              {isLoadingLocation 
                ? (language === 'ar' ? 'جاري تحديد موقعك...' : 'Detecting your location...')
                : isLoadingNearest
                  ? (language === 'ar' ? 'جاري البحث عن أقرب محطة...' : 'Finding nearest station...')
                  : (language === 'ar' ? 'جاري تحميل محطات المدينة...' : 'Loading city stations...')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default MapOverlays;
