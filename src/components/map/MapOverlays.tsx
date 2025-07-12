
import React, { useState, useEffect } from 'react';

import { GasStation } from '@/types/station';

interface MapOverlaysProps {
  isLoadingLocation: boolean;
  isLoadingNearest: boolean;
  selectedCity: string;
  filteredStations: GasStation[];
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

  // رسالة ترحيب تظهر مرة واحدة فقط عند أول زيارة
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.localStorage.getItem('noor_map_welcome_shown');
    }
    return true;
  });

  useEffect(() => {
    if (showWelcome && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        window.localStorage.setItem('noor_map_welcome_shown', '1');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  return (
    <>
      {/* رسالة ترحيب تظهر مرة واحدة فقط */}
      {showWelcome && !isLoadingLocation && !isLoadingCity && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center z-[9999]">
          <h3 className="text-2xl font-bold text-noor-purple mb-3">
            {language === 'ar' ? 'مرحباً بك في خريطة المحطات' : 'Welcome to the Stations Map'}
          </h3>
          <p className="text-gray-700 text-lg mb-2">
            {language === 'ar' ? 'يرجى اختيار مدينة من القائمة لعرض المحطات' : 'Please select a city to view stations'}
          </p>
        </div>
      )}

      {/* رسالة اختر مدينة تظهر فقط إذا لم يتم اختيار مدينة ولم تظهر رسالة الترحيب */}
      {!showWelcome && !selectedCity && filteredStations.length === 0 && !isLoadingLocation && !isLoadingCity && (
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
