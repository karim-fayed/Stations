
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { GasStation } from '@/types/station';
import { Language } from '@/i18n/translations';
import { MapTexts } from './types';
import { Loader2 } from "lucide-react";

interface MapSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  filteredStations: GasStation[];
  texts: MapTexts;
  language: Language;
  isSearching: boolean;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  filteredStations,
  texts,
  language,
  isSearching
}) => {
  const isRTL = language === Language.ARABIC;
  const placeholder = isRTL ? 'بحث عن محطة...' : 'Search for a station...';
  
  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full h-12 pl-10 ${isRTL ? 'text-right pr-4' : 'text-left'} bg-white`}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
      {isSearching && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
