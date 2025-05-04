
import React from 'react';
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapTexts } from './types';

interface MapSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  filteredStations: any[];
  texts: MapTexts;
  language: 'ar' | 'en';
  isSearching?: boolean;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  filteredStations,
  texts,
  language,
  isSearching = false
}) => {
  const hasSearchResults = debouncedSearchTerm !== '' && filteredStations.length > 0;

  return (
    <div className={`relative flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={texts.searchStations}
          className={`pr-10 ${language === 'ar' ? 'text-right' : 'text-left'}`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <div className="absolute inset-y-0 right-0 flex items-center mr-3">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : searchTerm ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {hasSearchResults && (
        <div className="absolute bottom-0 transform translate-y-full mt-1 w-full bg-white dark:bg-gray-800 py-1 text-sm rounded-md shadow-md z-50">
          <div className={`px-3 py-1.5 text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar'
              ? `تم العثور على ${filteredStations.length} نتيجة`
              : `Found ${filteredStations.length} results`}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
