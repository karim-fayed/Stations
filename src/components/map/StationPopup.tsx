
import React from 'react';
import { motion } from 'framer-motion';
import { GasStation } from '@/types/station';

interface StationPopupProps {
  station: GasStation;
  onSelectStation: (station: GasStation | null) => void; 
  language: 'ar' | 'en';
  texts: {
    region: string;
    subRegion: string;
    distance: string;
    fuelTypes: string;
    reset: string;
    directions: string;
    meters: string;
    kilometers: string;
  };
  onShowDirections: () => void;
}

const StationPopup: React.FC<StationPopupProps> = ({
  station,
  onSelectStation,
  language,
  texts,
  onShowDirections
}) => {
  const formatDistance = () => {
    if (!station.distance_meters) return null;
    
    return station.distance_meters > 1000 
      ? `${(station.distance_meters/1000).toFixed(2)} ${language === 'ar' ? 'كم' : 'km'}` 
      : `${Math.round(station.distance_meters)} ${language === 'ar' ? 'متر' : 'meters'}`;
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute left-4 right-4 bottom-4 max-w-md mx-auto bg-white/90 backdrop-blur-sm"
    >
      <div className={`p-4 rounded-lg shadow-lg ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        <h3 className="font-bold text-noor-purple text-lg">{station.name}</h3>
        <p className="text-sm text-muted-foreground">
          {texts.region} {station.region}
        </p>
        <p className="text-sm text-muted-foreground">
          {texts.subRegion} {station.sub_region}
        </p>
        {station.distance_meters && (
          <p className="text-sm text-muted-foreground">
            {texts.distance} {formatDistance()}
          </p>
        )}
        {station.fuel_types && (
          <p className="text-sm text-muted-foreground">
            {texts.fuelTypes} {station.fuel_types}
          </p>
        )}
        <div className="mt-3 flex justify-between gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            onClick={() => onSelectStation(null)}
          >
            {texts.reset}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-2 bg-noor-orange text-white rounded-md hover:bg-noor-orange/90 transition-colors"
            onClick={onShowDirections}
          >
            {texts.directions}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default StationPopup;
