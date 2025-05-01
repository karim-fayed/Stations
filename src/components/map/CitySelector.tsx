
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaudiCity } from './types';

interface CitySelectorProps {
  cities: SaudiCity[];
  selectedCity: string;
  onCityChange: (cityName: string) => void;
  language: 'ar' | 'en';
}

const CitySelector: React.FC<CitySelectorProps> = ({
  cities,
  selectedCity,
  onCityChange,
  language,
}) => {
  const texts = {
    selectCity: language === 'ar' ? 'اختر مدينة' : 'Select City',
  };

  return (
    <div className={`mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <Select 
        value={selectedCity} 
        onValueChange={onCityChange}
        dir={language === 'ar' ? 'rtl' : 'ltr'} 
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={texts.selectCity} />
        </SelectTrigger>
        <SelectContent dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {cities.map((city) => (
            <SelectItem key={city.nameEn} value={city.name}>
              {language === 'ar' ? city.name : city.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySelector;
