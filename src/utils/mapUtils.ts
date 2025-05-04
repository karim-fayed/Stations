
import { GasStation } from '@/types/station';
import { MapTexts } from '@/components/map/types';

export const createPopupContent = (station: GasStation, texts: MapTexts, language: 'ar' | 'en', onSelectStation: (station: GasStation) => void) => {
  const distance = station.distance_meters
    ? station.distance_meters > 1000
      ? `${(station.distance_meters / 1000).toFixed(2)} ${texts.kilometers}`
      : `${Math.round(station.distance_meters)} ${texts.meters}`
    : null;

  const content = document.createElement('div');
  content.className = 'px-3 py-2';
  content.dir = language === 'ar' ? 'rtl' : 'ltr';
  
  // Check language for layout direction
  const isRTL = language === 'ar';
  
  content.innerHTML = `
    <div class="bg-gradient-to-r from-noor-purple to-noor-light-purple p-2 -mt-2 -mx-3 mb-2 rounded-t-lg">
      <div class="font-bold text-white text-center">${station.name}</div>
    </div>
    <div class="grid grid-cols-2 gap-1 text-center mb-2">
      ${isRTL ? `
        <div class="text-xs text-gray-700 text-left">${station.region}</div>
        <div class="text-xs font-medium text-noor-purple text-right">${texts.region}</div>

        <div class="text-xs text-gray-700 text-left">${station.sub_region}</div>
        <div class="text-xs font-medium text-noor-purple text-right">${texts.subRegion}</div>

        ${station.fuel_types ? `
        <div class="text-xs text-gray-700 text-left">${station.fuel_types}</div>
        <div class="text-xs font-medium text-noor-purple text-right">${texts.fuelTypes}</div>
        ` : ''}

        ${distance ? `
        <div class="text-xs text-gray-700 text-left">${distance}</div>
        <div class="text-xs font-medium text-noor-purple text-right">${texts.distance}</div>
        ` : ''}
      ` : `
        <div class="text-xs font-medium text-noor-purple">${texts.region}</div>
        <div class="text-xs text-gray-700">${station.region}</div>

        <div class="text-xs font-medium text-noor-purple">${texts.subRegion}</div>
        <div class="text-xs text-gray-700">${station.sub_region}</div>

        ${station.fuel_types ? `
        <div class="text-xs font-medium text-noor-purple">${texts.fuelTypes}</div>
        <div class="text-xs text-gray-700">${station.fuel_types}</div>
        ` : ''}

        ${distance ? `
        <div class="text-xs font-medium text-noor-purple">${texts.distance}</div>
        <div class="text-xs text-gray-700">${distance}</div>
        ` : ''}
      `}
    </div>
    <button class="w-full mt-1 px-2 py-1.5 text-xs bg-noor-orange text-white rounded hover:bg-noor-orange/90 transition-all font-medium">${texts.clickForDetails}</button>
  `;

  // Add click event for details button
  const button = content.querySelector('button');
  if (button) {
    button.addEventListener('click', () => {
      onSelectStation(station);
    });
  }

  return content;
};

// Reset map to default state
export const resetMap = (
  map: mapboxgl.Map | null, 
  onSelectStation: (station: GasStation | null) => void, 
  setSearchTerm: (term: string) => void,
  setDebouncedSearchTerm: (term: string) => void,
  setUserLocation: any, // Updated to accept a callback function instead of expecting an object
  setSelectedCity: (city: string) => void,
  setFilteredStations: (stations: GasStation[]) => void,
  language: 'ar' | 'en',
  toast: any
) => {
  // Deselect station
  onSelectStation(null);

  // Reset search field
  setSearchTerm('');
  setDebouncedSearchTerm('');

  // Reset user location
  setUserLocation(null);

  // Reset city
  setSelectedCity('');
  
  // Clear filtered stations
  setFilteredStations([]);

  // Reset map to default position (Saudi Arabia)
  if (map) {
    // Center on Saudi Arabia
    map.flyTo({
      center: [45.079, 23.885], // Center of Saudi Arabia
      zoom: 5,
      essential: true,
      duration: 1500
    });

    toast({
      title: language === 'ar' ? 'تم إعادة تعيين الخريطة' : 'Map has been reset',
      description: language === 'ar' ? 'يمكنك اختيار مدينة لعرض المحطات فيها' : 'Choose a city to view its stations',
    });
  }
};
