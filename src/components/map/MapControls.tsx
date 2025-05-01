
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from "lucide-react";

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
  language: 'ar' | 'en';
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
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </>
        ) : texts.getLocation}
      </motion.button>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 border border-noor-purple text-noor-purple rounded-md hover:bg-noor-purple/10 transition-colors flex items-center justify-center"
        onClick={onFindNearest}
        disabled={isLoadingNearest || !hasUserLocation}
      >
        {isLoadingNearest ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
          </>
        ) : texts.findNearest}
      </motion.button>
    </div>
  );
};

export default MapControls;
