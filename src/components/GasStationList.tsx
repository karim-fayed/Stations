
import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, MapPin, Search } from "lucide-react";
import { GasStation } from "@/types/station";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { fetchStationsByRegion } from '@/services/stationService';

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
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredStations, setFilteredStations] = useState<GasStation[]>(stations);

  const translations = useMemo(() => ({
    selectRegion: language === 'ar' ? 'اختر منطقة' : 'Select Region',
    allRegions: language === 'ar' ? 'جميع المناطق' : 'All Regions',
    region: language === 'ar' ? 'المنطقة' : 'Region',
    location: language === 'ar' ? 'الموقع' : 'Location',
    fuelTypes: language === 'ar' ? 'أنواع الوقود' : 'Fuel Types',
    distanceFromCenter: language === 'ar' ? 'من مركز المدينة (كم)' : 'From City Center (km)',
    showDirections: language === 'ar' ? 'عرض الاتجاهات' : 'Show Directions',
    map: language === 'ar' ? 'الخريطة' : 'Map',
    noStations: language === 'ar' ? 'لا توجد محطات في هذه المنطقة' : 'No stations in this region',
    search: language === 'ar' ? 'بحث عن محطة...' : 'Search stations...',
  }), [language]);

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(stations.map(station => station.region)));
    return uniqueRegions;
  }, [stations]);

  // تحديث القائمة عند تغيير المنطقة المحددة
  useEffect(() => {
    const filterStations = async () => {
      try {
        // استخدام البيانات الحالية للمحطات بدلاً من جلبها مرة أخرى
        let filtered;
        
        if (selectedRegion === 'all') {
          filtered = stations;
        } else {
          filtered = stations.filter(station => station.region === selectedRegion);
        }

        // تطبيق البحث إذا كان هناك مصطلح بحث
        if (searchTerm) {
          filtered = filtered.filter(station => 
            station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.sub_region.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setFilteredStations(filtered);
      } catch (error) {
        console.error('Error filtering stations:', error);
        setFilteredStations([]);
      }
    };

    filterStations();
  }, [selectedRegion, stations, searchTerm]);

  // تنسيق المسافة
  const formatDistance = (station: GasStation) => {
    if (station.distance_meters) {
      return station.distance_meters > 1000 
        ? `${(station.distance_meters/1000).toFixed(2)} ${language === 'ar' ? 'كم' : 'km'}`
        : `${Math.round(station.distance_meters)} ${language === 'ar' ? 'متر' : 'm'}`;
    }
    return '-';
  };

  // تأثيرات متحركة للصف المحدد
  const rowVariants = {
    selected: { scale: 1.01, backgroundColor: "rgba(102, 51, 204, 0.1)" },
    normal: { scale: 1, backgroundColor: "transparent" }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Select
          value={selectedRegion}
          onValueChange={setSelectedRegion}
        >
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder={translations.selectRegion} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{translations.allRegions}</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          <Input
            className="w-full pl-10"
            placeholder={translations.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">{translations.region}</TableHead>
              <TableHead>{translations.location}</TableHead>
              <TableHead className="hidden md:table-cell">{translations.fuelTypes}</TableHead>
              <TableHead className="text-center">{translations.distanceFromCenter}</TableHead>
              <TableHead className="w-[100px]">{translations.map}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map((station) => (
              <motion.tr 
                key={station.id}
                initial="normal"
                animate={selectedStation?.id === station.id ? "selected" : "normal"}
                variants={rowVariants}
                transition={{ duration: 0.2 }}
                className={`${selectedStation?.id === station.id ? 'bg-muted' : ''} cursor-pointer`}
                onClick={() => onSelectStation(station)}
              >
                <TableCell className="font-medium">{station.region}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-noor-purple" />
                    {station.sub_region}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{station.fuel_types || '-'}</TableCell>
                <TableCell className="text-center">{formatDistance(station)}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStation(station);
                    }}
                  >
                    <ChevronRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
            {filteredStations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {translations.noStations}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default GasStationList;
