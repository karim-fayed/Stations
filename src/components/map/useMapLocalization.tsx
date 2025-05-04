
import { useMemo } from 'react';
import { MapTexts } from './types';
import { Language } from '@/i18n/translations';

export const useMapLocalization = (language: Language): MapTexts => {
  const texts = useMemo(() => ({
    getLocation: language === Language.ARABIC ? 'تحديد موقعك' : 'Get Your Location',
    directions: language === Language.ARABIC ? 'عرض الاتجاهات' : 'Show Directions',
    nearestStation: language === Language.ARABIC ? 'أقرب محطة إليك' : 'Nearest Station',
    reset: language === Language.ARABIC ? 'إعادة تعيين' : 'Reset',
    findNearest: language === Language.ARABIC ? 'البحث عن أقرب محطة' : 'Find Nearest Station',
    locationDetecting: language === Language.ARABIC ? 'جاري تحديد موقعك' : 'Detecting your location',
    pleaseWait: language === Language.ARABIC ? 'يرجى الانتظار قليلاً...' : 'Please wait a moment...',
    locationDetected: language === Language.ARABIC ? 'تم تحديد موقعك' : 'Location detected',
    nearestStationIs: language === Language.ARABIC ? 'أقرب محطة إليك هي' : 'Your nearest station is',
    showingDirections: language === Language.ARABIC ? 'جاري عرض الاتجاهات' : 'Showing Directions',
    directionsTo: language === Language.ARABIC ? 'جاري عرض الاتجاهات إلى' : 'Showing directions to',
    meters: language === Language.ARABIC ? 'متر' : 'meters',
    kilometers: language === Language.ARABIC ? 'كم' : 'km',
    locationError: language === Language.ARABIC ? 'خطأ في تحديد الموقع' : 'Location Error',
    enableLocation: language === Language.ARABIC ? 'يرجى تفعيل خدمة تحديد الموقع' : 'Please enable location services',
    fuelTypes: language === Language.ARABIC ? 'أنواع الوقود:' : 'Fuel Types:',
    region: language === Language.ARABIC ? 'المنطقة:' : 'Region:',
    subRegion: language === Language.ARABIC ? 'الموقع:' : 'Location:',
    distance: language === Language.ARABIC ? 'المسافة:' : 'Distance:',
    name: language === Language.ARABIC ? 'الاسم:' : 'Name:',
    clickForDetails: language === Language.ARABIC ? 'اضغط للتفاصيل' : 'Click for details',
    selectCity: language === Language.ARABIC ? 'اختر مدينة' : 'Select City',
    searchStation: language === Language.ARABIC ? 'البحث عن محطة...' : 'Search for a station...',
    noResults: language === Language.ARABIC ? 'لا توجد نتائج للبحث' : 'No search results',
    searchResults: language === Language.ARABIC ? 'نتائج البحث' : 'Search results',
  }), [language]);

  return texts;
};
