
import React from 'react';
import { GasStation } from '@/types/station';
import { MapTexts } from '@/components/map/types';
import { Language } from '@/i18n/translations';
import CitySelector from './CitySelector';
import MapSearchBar from './MapSearchBar';

interface SearchFilterSectionProps {
  cities: any[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  filteredStations: GasStation[];
  texts: MapTexts;
  language: Language;
  isSearching: boolean;
}

const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  cities,
  selectedCity,
  onCityChange,
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  filteredStations,
  texts,
  language,
  isSearching
}) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-2">
      {/* City Selector Component */}
      <div className="flex-1">
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onCityChange={onCityChange}
          language={language}
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

export default SearchFilterSection;
