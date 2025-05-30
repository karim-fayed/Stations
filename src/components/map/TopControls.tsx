
import React from 'react';
import CitySelector from './CitySelector';
import MapSearchBar from './MapSearchBar';
import { SaudiCity } from '@/types/station';
import { useLanguage } from '@/i18n/LanguageContext';

interface TopControlsProps {
  cities: SaudiCity[];
  selectedCity: string;
  onCityChange: (cityName: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  filteredStations: any[];
  texts: any;
  language?: 'ar' | 'en'; // Hacemos el parámetro opcional
  isSearching: boolean;
  refreshCities?: () => void;
}

const TopControls: React.FC<TopControlsProps> = ({
  cities,
  selectedCity,
  onCityChange,
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  filteredStations,
  texts,
  language: propLanguage,
  isSearching,
  refreshCities
}) => {
  // Usamos el contexto de idioma
  const { language: contextLanguage } = useLanguage();

  // Usamos el idioma proporcionado como prop o el del contexto
  const language = propLanguage || contextLanguage;
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-2">
      {/* City Selector Component */}
      <div className="flex-1">
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onCityChange={onCityChange}
          language={language}
          refreshCities={refreshCities}
        />
      </div>

      {/* Search Field */}
      <MapSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        filteredStations={filteredStations}
        texts={texts}
        language={language}
        isSearching={isSearching}
      />
    </div>
  );
};

export default TopControls;
