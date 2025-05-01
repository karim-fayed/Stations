
import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight } from "lucide-react";

interface GasStation {
  id: string;
  name: string;
  area: string;
  location: string;
  distance: number; // in km
  distanceFromCenter: number; // in km
  latitude: number;
  longitude: number;
}

interface GasStationListProps {
  stations: GasStation[];
  onSelectStation: (station: GasStation) => void;
  selectedStation: GasStation | null;
  language: 'ar' | 'en';
}

const GasStationList: React.FC<GasStationListProps> = ({
  stations,
  onSelectStation,
  selectedStation,
  language
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  
  const translations = useMemo(() => ({
    selectArea: language === 'ar' ? 'اختر منطقة' : 'Select Area',
    allAreas: language === 'ar' ? 'جميع المناطق' : 'All Areas',
    area: language === 'ar' ? 'المنطقة' : 'Area',
    location: language === 'ar' ? 'الموقع' : 'Location',
    fromCityCenter: language === 'ar' ? 'من مركز المدينة (كم)' : 'From City Center (km)',
    showDirections: language === 'ar' ? 'عرض الاتجاهات' : 'Show Directions',
    map: language === 'ar' ? 'الخريطة' : 'Map',
  }), [language]);

  const areas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(stations.map(station => station.area)));
    return uniqueAreas;
  }, [stations]);

  const filteredStations = useMemo(() => {
    if (selectedArea === 'all') return stations;
    return stations.filter(station => station.area === selectedArea);
  }, [selectedArea, stations]);

  return (
    <div className={`w-full ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mb-4">
        <Select
          value={selectedArea}
          onValueChange={setSelectedArea}
        >
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder={translations.selectArea} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{translations.allAreas}</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">{translations.area}</TableHead>
              <TableHead>{translations.location}</TableHead>
              <TableHead className="text-center">{translations.fromCityCenter}</TableHead>
              <TableHead className="w-[100px]">{translations.map}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map((station) => (
              <TableRow 
                key={station.id}
                className={selectedStation?.id === station.id ? 'bg-muted' : ''}
              >
                <TableCell className="font-medium">{station.area}</TableCell>
                <TableCell>{station.location}</TableCell>
                <TableCell className="text-center">{station.distanceFromCenter}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-8 w-8"
                    onClick={() => onSelectStation(station)}
                  >
                    <ChevronRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredStations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {language === 'ar' ? 'لا توجد محطات في هذه المنطقة' : 'No stations in this area'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GasStationList;
