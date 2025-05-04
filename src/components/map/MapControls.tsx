
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Language } from '@/i18n/translations';

interface MapControlsProps {
  onGetLocation: () => void;
  onFindNearest: () => void;
  isLoadingLocation: boolean;
  isLoadingNearest: boolean;
  hasUserLocation: boolean;
  texts: {
    getLocation: string;
    findNearest: string;
  };
  language: Language;
}

const MapControls: React.FC<MapControlsProps> = ({
  onGetLocation,
  onFindNearest,
  isLoadingLocation,
  isLoadingNearest,
  hasUserLocation,
  texts,
  language
}) => {
  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-between">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-noor-purple text-white rounded-md hover:bg-noor-purple/90 transition-colors flex items-center justify-center"
        onClick={onGetLocation}
        disabled={isLoadingLocation}
      >
        {isLoadingLocation ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === Language.ARABIC ? 'جاري التحميل...' : 'Loading...'}
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            {texts.getLocation}
          </>
        )}
      </motion.button>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 border rounded-md flex items-center justify-center transition-colors ${
          hasUserLocation 
            ? "border-noor-orange text-noor-orange hover:bg-noor-orange/10" 
            : "border-gray-300 text-gray-400"
        }`}
        onClick={onFindNearest}
        disabled={isLoadingNearest || !hasUserLocation}
        title={!hasUserLocation ? (language === Language.ARABIC ? 'الرجاء تحديد موقعك أولاً' : 'Please get your location first') : ''}
      >
        {isLoadingNearest ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === Language.ARABIC ? 'جاري البحث...' : 'Searching...'}
          </>
        ) : (
          <>
            <Navigation className="mr-2 h-4 w-4" />
            {texts.findNearest}
          </>
        )}
      </motion.button>
    </div>
  );
};

export default MapControls;
