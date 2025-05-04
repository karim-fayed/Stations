
import { useToast } from "@/hooks/use-toast";
import { GasStation } from '@/types/station';
import { MapTexts } from '@/components/map/types';
import { Language } from '@/i18n/translations';

interface DirectionsOptions {
  language: Language;
  texts: MapTexts;
}

export const useDirections = ({ language, texts }: DirectionsOptions) => {
  const { toast } = useToast();

  // Show directions to selected station
  const showDirections = (station: GasStation | null, userLocation: { latitude: number; longitude: number } | null) => {
    if (!station) return;

    toast({
      title: texts.showingDirections,
      description: `${texts.directionsTo} ${station.name}`,
    });

    // If we have user location, use it as the starting point
    const url = userLocation 
      ? `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${station.latitude},${station.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    
    window.open(url, '_blank');
  };

  return { showDirections };
};
