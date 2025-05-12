
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaudiCity } from '@/types/station';
import { useLanguage } from '@/i18n/LanguageContext';

interface CitySelectorProps {
  cities: SaudiCity[];
  selectedCity: string;
  onCityChange: (cityName: string) => void;
  language?: 'ar' | 'en'; // Hacemos el parámetro opcional
  refreshCities?: () => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  cities,
  selectedCity,
  onCityChange,
  language: propLanguage
}) => {
  // Usamos el contexto de idioma
  const { language: contextLanguage, t } = useLanguage();

  // Usamos el idioma proporcionado como prop o el del contexto
  const language = propLanguage || contextLanguage;

  const texts = {
    selectCity: language === 'ar' ? 'اختر منطقة' : 'Select Region',
  };

  // Handle city change with improved logging for debugging
  const handleCityChange = (value: string) => {
    console.log(`City selected: ${value}`);
    onCityChange(value);
  };

  // Log available cities for debugging
  useEffect(() => {
    console.log(`CitySelector loaded with ${cities.length} cities available`);
  }, [cities]);

  return (
    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <Select
        value={selectedCity}
        onValueChange={handleCityChange}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={texts.selectCity} />
        </SelectTrigger>
        <SelectContent dir={language === 'ar' ? 'rtl' : 'ltr'} className="max-h-[300px]">
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
