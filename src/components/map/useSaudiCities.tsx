
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
  ], []);

  return saudiCities;
};
