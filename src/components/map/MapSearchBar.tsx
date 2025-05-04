
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MapTexts } from './types';

interface MapSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearchTerm: string;
  filteredStations: any[];
  texts: Pick<MapTexts, 'searchStation' | 'searchResults' | 'noResults'>;
  language: 'ar' | 'en';
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  filteredStations,
  texts,
  language
}) => {
  return (
    <div className="relative flex-1">
      <Input
        className="w-full pl-10"
        placeholder={texts.searchStation}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

      {/* Search Results Count */}
      {searchTerm && (
        <div className="mt-1 text-xs text-muted-foreground">
          {searchTerm !== debouncedSearchTerm ? (
            <span className="animate-pulse">{language === 'ar' ? 'جاري البحث...' : 'Searching...'}</span>
          ) : filteredStations.length > 0 ? (
            `${texts.searchResults}: ${filteredStations.length}`
          ) : (
            texts.noResults
          )}
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
