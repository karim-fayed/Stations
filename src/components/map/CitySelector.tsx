
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaudiCity } from '@/types/station';
import { Language } from '@/i18n/translations';

interface CitySelectorProps {
  cities: SaudiCity[];
  selectedCity: string;
  onCityChange: (cityName: string) => void;
  language: Language;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  cities,
  selectedCity,
  onCityChange,
  language,
}) => {
  const isRTL = language === Language.ARABIC;
  const texts = {
    selectCity: isRTL ? 'اختر مدينة' : 'Select City',
  };

  return (
    <Select
      value={selectedCity}
      onValueChange={onCityChange}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <SelectTrigger className="w-full bg-white h-12 border border-gray-200 rounded-md">
        <SelectValue placeholder={texts.selectCity} />
      </SelectTrigger>
      <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className="max-h-[300px]">
        {cities.map((city) => (
          <SelectItem key={city.nameEn} value={city.name}>
            {isRTL ? city.name : city.nameEn}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CitySelector;
