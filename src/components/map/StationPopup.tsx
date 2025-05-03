
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
  onReset?: () => void; // دالة إعادة التعيين الكاملة (اختيارية)
}

const StationPopup: React.FC<StationPopupProps> = ({
  station,
  onSelectStation,
  language,
  texts,
  onShowDirections,
  onReset
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
      className="absolute left-4 right-4 bottom-4 max-w-md mx-auto"
    >
      <div className={`p-5 rounded-xl shadow-lg border border-purple-100 bg-white/95 backdrop-blur-md ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        {/* Header with gradient background */}
        <div className="rounded-lg bg-gradient-to-r from-noor-purple to-noor-light-purple p-3 -mt-8 mb-3 shadow-md">
          <h3 className="font-bold text-white text-lg text-center">{station.name}</h3>
        </div>

        {/* Station details in a grid layout */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="font-medium text-noor-purple">{texts.region}:</div>
          <div className="text-gray-700">{station.region}</div>

          <div className="font-medium text-noor-purple">{texts.subRegion}:</div>
          <div className="text-gray-700">{station.sub_region}</div>

          {station.distance_meters && (
            <>
              <div className="font-medium text-noor-purple">{texts.distance}:</div>
              <div className="text-gray-700">{formatDistance()}</div>
            </>
          )}

          {station.fuel_types && (
            <>
              <div className="font-medium text-noor-purple">{texts.fuelTypes}:</div>
              <div className="text-gray-700">{station.fuel_types}</div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex justify-between gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
            onClick={() => {
              // استخدام دالة إعادة التعيين الكاملة إذا كانت متوفرة، وإلا استخدام الدالة الافتراضية
              if (onReset) {
                onReset();
              } else {
                onSelectStation(null);
              }
            }}
          >
            {texts.reset}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-2.5 bg-noor-orange text-white rounded-md hover:bg-noor-orange/90 transition-colors font-medium"
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
