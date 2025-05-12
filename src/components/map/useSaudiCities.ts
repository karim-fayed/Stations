
import { useEffect, useState } from 'react';
import { SaudiCity } from '../../types/station';
import { useToast } from '@/hooks/use-toast';
import { fetchCities, getDefaultCities } from '@/services/cityService';

export const useSaudiCities = () => {
  const [cities, setCities] = useState<SaudiCity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const { toast } = useToast();

  // دالة لتحديث قائمة المدن
  const refreshCities = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // دالة لإضافة مدينة محلية إلى القائمة
  const addLocalCity = (newCity: SaudiCity) => {
    setCities(prevCities => {
      // التحقق من عدم وجود المدينة بالفعل في القائمة
      const exists = prevCities.some(city =>
        city.name === newCity.name ||
        (city.latitude === newCity.latitude && city.longitude === newCity.longitude)
      );

      if (exists) {
        return prevCities;
      }

      // إضافة المدينة الجديدة وترتيب القائمة أبجديًا
      return [...prevCities, newCity].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  useEffect(() => {
    const getCities = async () => {
      try {
        setIsLoading(true);

        // استخدام الخدمة الجديدة لجلب المدن
        const citiesData = await fetchCities();
        setCities(citiesData);

      } catch (error) {
        console.error('Error fetching cities:', error);
        toast({
          title: 'خطأ في جلب المدن',
          description: 'حدث خطأ أثناء محاولة جلب قائمة المدن. تم استخدام القائمة الافتراضية.',
          variant: 'destructive',
        });

        // استخدام قائمة المدن الافتراضية في حالة حدوث أي خطأ
        const defaultCities = getDefaultCities();
        setCities(defaultCities);
      } finally {
        setIsLoading(false);
      }
    };

    getCities();
  }, [toast, refreshTrigger]);

  return { cities, isLoading, refreshCities, addLocalCity };
};
