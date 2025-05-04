
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
  const texts = {
    selectCity: language === Language.ARABIC ? 'اختر مدينة' : 'Select City',
  };

  return (
    <div className={`${language === Language.ARABIC ? 'text-right' : 'text-left'}`}>
      <Select
        value={selectedCity}
        onValueChange={onCityChange}
        dir={language === Language.ARABIC ? 'rtl' : 'ltr'}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={texts.selectCity} />
        </SelectTrigger>
        <SelectContent dir={language === Language.ARABIC ? 'rtl' : 'ltr'}>
          {cities.map((city) => (
            <SelectItem key={city.nameEn} value={city.name}>
              {language === Language.ARABIC ? city.name : city.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySelector;
