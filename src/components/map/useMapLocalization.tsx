
import { useMemo } from 'react';
import { MapTexts } from './types';
import { Language } from '@/i18n/translations';
import { useLanguage } from '@/i18n/LanguageContext';

export const useMapLocalization = (language: Language): MapTexts => {
  const { t } = useLanguage();
  
  return useMemo(() => ({
    getLocation: t('map', 'getLocation'),
    directions: t('map', 'directions'),
    nearestStation: t('map', 'nearestStation'),
    reset: t('map', 'reset'),
    findNearest: t('map', 'findNearest'),
    locationDetecting: t('map', 'locationDetecting'),
    pleaseWait: t('map', 'pleaseWait'),
    locationDetected: t('map', 'locationDetected'),
    nearestStationIs: t('map', 'nearestStationIs'),
    showingDirections: t('map', 'showingDirections'),
    directionsTo: t('map', 'directionsTo'),
    meters: t('map', 'meters'),
    kilometers: t('map', 'kilometers'),
    locationError: t('map', 'locationError'),
    enableLocation: t('map', 'enableLocation'),
    fuelTypes: t('map', 'fuelTypes'),
    region: t('map', 'region'),
    subRegion: t('map', 'subRegion'),
    distance: t('map', 'distance'),
    name: t('map', 'name'),
    clickForDetails: t('map', 'clickForDetails'),
    selectCity: t('map', 'selectCity'),
    searchStation: t('map', 'searchStation'),
    noResults: t('map', 'noResults'),
    searchResults: t('map', 'searchResults'),
  }), [language, t]);
};
