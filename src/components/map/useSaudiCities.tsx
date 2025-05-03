
import { useMemo } from 'react';
import { SaudiCity } from './types';

export const useSaudiCities = (): SaudiCity[] => {
  // قائمة المدن الرئيسية في المملكة العربية السعودية مع إحداثياتها
  const saudiCities = useMemo(() => [
    { name: 'الرياض', nameEn: 'Riyadh', latitude: 24.7136, longitude: 46.6753, zoom: 10 },
    { name: 'جدة', nameEn: 'Jeddah', latitude: 21.4858, longitude: 39.1925, zoom: 10 },
    { name: 'مكة المكرمة', nameEn: 'Mecca', latitude: 21.3891, longitude: 39.8579, zoom: 10 },
    { name: 'المدينة المنورة', nameEn: 'Medina', latitude: 24.5247, longitude: 39.5692, zoom: 10 },
    { name: 'الدمام', nameEn: 'Dammam', latitude: 26.4207, longitude: 50.0888, zoom: 10 },
    { name: 'الخبر', nameEn: 'Khobar', latitude: 26.2172, longitude: 50.1971, zoom: 10 },
    { name: 'تبوك', nameEn: 'Tabuk', latitude: 28.3998, longitude: 36.5717, zoom: 10 },
    { name: 'نجران', nameEn: 'Najran', latitude: 17.4924, longitude: 44.1277, zoom: 10 },
    { name: 'الخرج', nameEn: 'Al Kharj', latitude: 24.1500, longitude: 47.3000, zoom: 10 },
    { name: 'حائل', nameEn: 'Hail', latitude: 27.5219, longitude: 41.7200, zoom: 10 },
    { name: 'جازان', nameEn: 'Jazan', latitude: 16.8892, longitude: 42.5611, zoom: 10 },
    { name: 'عسير', nameEn: 'Asir', latitude: 19.0000, longitude: 43.0000, zoom: 9 },
    { name: 'القصيم', nameEn: 'Qassim', latitude: 26.3258, longitude: 43.9677, zoom: 9 },
    { name: 'الباحة', nameEn: 'Al Baha', latitude: 20.0000, longitude: 41.4500, zoom: 10 },
    { name: 'الجوف', nameEn: 'Al Jawf', latitude: 29.8818, longitude: 40.1000, zoom: 9 },
    { name: 'الحدود الشمالية', nameEn: 'Northern Borders', latitude: 30.0000, longitude: 42.0000, zoom: 8 },
  ], []);

  return saudiCities;
};
