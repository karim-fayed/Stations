
import React from 'react';
import { GasStation } from '@/types/station';
import { MapTexts } from '@/components/map/types';
import { Language } from '@/i18n/translations';
import CitySelector from './CitySelector';
import MapSearchBar from './MapSearchBar';
import { Search } from 'lucide-react';

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
  const isRTL = language === 'ar';
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4">
        {/* City Selector */}
        <div className={`relative rounded-md border shadow-sm ${isRTL ? 'rtl' : 'ltr'}`}>
          <CitySelector
            cities={cities}
            selectedCity={selectedCity}
            onCityChange={onCityChange}
            language={language}
          />
        </div>

        {/* Search Field */}
        <div className={`relative rounded-md shadow-sm ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
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
      </div>
    </div>
  );
};

export default SearchFilterSection;
