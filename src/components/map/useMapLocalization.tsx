
import { useMemo } from 'react';
import { MapTexts } from './types';

export const useMapLocalization = (language: 'ar' | 'en'): MapTexts => {
  const texts = useMemo(() => ({
    getLocation: language === 'ar' ? 'تحديد موقعك' : 'Get Your Location',
    directions: language === 'ar' ? 'عرض الاتجاهات' : 'Show Directions',
    nearestStation: language === 'ar' ? 'أقرب محطة إليك' : 'Nearest Station',
    reset: language === 'ar' ? 'إعادة تعيين' : 'Reset',
    findNearest: language === 'ar' ? 'البحث عن أقرب محطة' : 'Find Nearest Station',
    locationDetecting: language === 'ar' ? 'جاري تحديد موقعك' : 'Detecting your location',
    pleaseWait: language === 'ar' ? 'يرجى الانتظار قليلاً...' : 'Please wait a moment...',
    locationDetected: language === 'ar' ? 'تم تحديد موقعك' : 'Location detected',
    nearestStationIs: language === 'ar' ? 'أقرب محطة إليك هي' : 'Your nearest station is',
    showingDirections: language === 'ar' ? 'جاري عرض الاتجاهات' : 'Showing Directions',
    directionsTo: language === 'ar' ? 'جاري عرض الاتجاهات إلى' : 'Showing directions to',
    meters: language === 'ar' ? 'متر' : 'meters',
    kilometers: language === 'ar' ? 'كم' : 'km',
    locationError: language === 'ar' ? 'خطأ في تحديد الموقع' : 'Location Error',
    enableLocation: language === 'ar' ? 'يرجى تفعيل خدمة تحديد الموقع' : 'Please enable location services',
    fuelTypes: language === 'ar' ? 'أنواع الوقود:' : 'Fuel Types:',
    region: language === 'ar' ? 'المنطقة:' : 'Region:',
    subRegion: language === 'ar' ? 'الموقع:' : 'Location:',
    distance: language === 'ar' ? 'المسافة:' : 'Distance:',
    name: language === 'ar' ? 'الاسم:' : 'Name:',
    clickForDetails: language === 'ar' ? 'اضغط للتفاصيل' : 'Click for details',
    selectCity: language === 'ar' ? 'اختر مدينة' : 'Select City',
    searchStation: language === 'ar' ? 'البحث عن محطة...' : 'Search for a station...',
    noResults: language === 'ar' ? 'لا توجد نتائج للبحث' : 'No search results',
    searchResults: language === 'ar' ? 'نتائج البحث' : 'Search results',
  }), [language]);

  return texts;
};
