
import { useEffect, useState } from 'react';
import { SaudiCity } from '../../types/station';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSaudiCities = () => {
  const [cities, setCities] = useState<SaudiCity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        // Get cities from the database
        const { data, error } = await supabase
          .from('cities')
          .select('*');

        if (error) {
          throw error;
        }

        // Map database cities to SaudiCity interface
        const mappedCities: SaudiCity[] = data.map(city => ({
          name: city.name_ar,
          nameEn: city.name_en,
          latitude: city.latitude,
          longitude: city.longitude,
          zoom: city.zoom || 10
        }));

        setCities(mappedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast({
          title: 'خطأ في جلب المدن',
          description: 'حدث خطأ أثناء محاولة جلب قائمة المدن',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [toast]);

  return { cities, isLoading };
};
