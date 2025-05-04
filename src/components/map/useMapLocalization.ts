
import { useState, useEffect } from 'react';
import { MapTexts } from './types';
import { Language } from '@/i18n/translations';

export const useMapLocalization = (language: Language): MapTexts => {
  return {
    getLocation: language === Language.ARABIC ? 'نتعرف بتواجدك' : 'Detect Your Location',
    directions: language === Language.ARABIC ? 'عرض الاتجاهات' : 'Show Directions',
    nearestStation: language === Language.ARABIC ? 'أقرب محطة إليك' : 'Nearest Station',
    reset: language === Language.ARABIC ? 'إعادة تعيين' : 'Reset',
    findNearest: language === Language.ARABIC ? 'عرض أقرب محطة' : 'Show Nearest Station',
    locationDetecting: language === Language.ARABIC ? 'جاري تحديد موقعك' : 'Detecting your location',
    pleaseWait: language === Language.ARABIC ? 'يرجى الانتظار قليلاً...' : 'Please wait a moment...',
    locationDetected: language === Language.ARABIC ? 'تم تحديد موقعك' : 'Location detected',
    nearestStationIs: language === Language.ARABIC ? 'أقرب محطة إليك هي' : 'Your nearest station is',
    showingDirections: language === Language.ARABIC ? 'عرض الاتجاهات' : 'Showing Directions',
    directionsTo: language === Language.ARABIC ? 'الاتجاهات إلى' : 'Directions to',
    meters: language === Language.ARABIC ? 'متر' : 'm',
    kilometers: language === Language.ARABIC ? 'كم' : 'km',
    locationError: language === Language.ARABIC ? 'خطأ في تحديد الموقع' : 'Location Error',
    enableLocation: language === Language.ARABIC ? 'يرجى تفعيل خدمة تحديد الموقع' : 'Please enable location services',
    fuelTypes: language === Language.ARABIC ? 'أنواع الوقود' : 'Fuel Types',
    region: language === Language.ARABIC ? 'المنطقة' : 'Region',
    subRegion: language === Language.ARABIC ? 'الموقع' : 'Location',
    distance: language === Language.ARABIC ? 'المسافة' : 'Distance',
    name: language === Language.ARABIC ? 'الاسم' : 'Name',
    clickForDetails: language === Language.ARABIC ? 'انقر للتفاصيل' : 'Click for details',
    selectCity: language === Language.ARABIC ? 'اختر مدينة' : 'Select City',
    searchStation: language === Language.ARABIC ? 'بحث عن محطة...' : 'Search for a station...',
    noResults: language === Language.ARABIC ? 'لا توجد نتائج' : 'No results found',
    searchResults: language === Language.ARABIC ? 'نتائج البحث' : 'Search results',
  };
};
