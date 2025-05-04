import { useState, useEffect } from 'react';
import { MapTexts } from './types';

export const useMapLocalization = (language: 'ar' | 'en') => {
  return {
    getLocation: language === 'ar' ? 'نتعرف بتواجدك' : 'Detect Your Location',
    directions: language === 'ar' ? 'عرض الاتجاهات' : 'Show Directions',
    nearestStation: language === 'ar' ? 'أقرب محطة إليك' : 'Nearest Station',
    reset: language === 'ar' ? 'إعادة تعيين' : 'Reset',
    findNearest: language === 'ar' ? 'عرض أقرب محطة' : 'Show Nearest Station',
    locationDetecting: language === 'ar' ? 'جاري تحديد موقعك' : 'Detecting your location',
    pleaseWait: language === 'ar' ? 'يرجى الانتظار قليلاً...' : 'Please wait a moment...',
    locationDetected: language === 'ar' ? 'تم تحديد موقعك' : 'Location detected',
    nearestStationIs: language === 'ar' ? 'أقرب محطة إليك هي' : 'Your nearest station is',
    showingDirections: language === 'ar' ? 'عرض الاتجاهات' : 'Showing Directions',
    directionsTo: language === 'ar' ? 'الاتجاهات إلى' : 'Directions to',
    meters: language === 'ar' ? 'متر' : 'm',
    kilometers: language === 'ar' ? 'كم' : 'km',
    locationError: language === 'ar' ? 'خطأ في تحديد الموقع' : 'Location Error',
    enableLocation: language === 'ar' ? 'يرجى تفعيل خدمة تحديد الموقع' : 'Please enable location services',
    fuelTypes: language === 'ar' ? 'أنواع الوقود' : 'Fuel Types',
    region: language === 'ar' ? 'المنطقة' : 'Region',
    subRegion: language === 'ar' ? 'الموقع' : 'Location',
    distance: language === 'ar' ? 'المسافة' : 'Distance',
    name: language === 'ar' ? 'الاسم' : 'Name',
    clickForDetails: language === 'ar' ? 'انقر للتفاصيل' : 'Click for details',
    selectCity: language === 'ar' ? 'اختر مدينة' : 'Select City',
    searchStation: language === 'ar' ? 'بحث عن محطة...' : 'Search for a station...',
    noResults: language === 'ar' ? 'لا توجد نتائج' : 'No results found',
    searchResults: language === 'ar' ? 'نتائج البحث' : 'Search results',
  };
};
