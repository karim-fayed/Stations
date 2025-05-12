import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertTriangle, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GasStation } from "@/types/station";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { checkDuplicateStationsInList } from "@/services/stationService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";
import { textContains } from "@/utils/textUtils";

interface StationsTableProps {
  stations: GasStation[];
  onEdit: (station: GasStation) => void;
  onDelete: (station: GasStation) => void;
}

const StationsTable = ({ stations, onEdit, onDelete }: StationsTableProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // عدد المحطات في كل صفحة - تم تغييره من 5 إلى 10
  const [paginatedStations, setPaginatedStations] = useState<GasStation[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [duplicateStations, setDuplicateStations] = useState<Map<string, boolean>>(new Map());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredStations, setFilteredStations] = useState<GasStation[]>([]);
  const { t, language } = useLanguage();

  // ترجمات الجدول
  const tableTexts = {
    id: language === 'ar' ? '#' : '#',
    name: language === 'ar' ? 'الاسم' : 'Name',
    region: language === 'ar' ? 'المنطقة' : 'Region',
    subRegion: language === 'ar' ? 'الموقع الفرعي' : 'Sub-location',
    fuelTypes: language === 'ar' ? 'أنواع الوقود' : 'Fuel Types',
    coordinates: language === 'ar' ? 'الإحداثيات' : 'Coordinates',
    actions: language === 'ar' ? 'الإجراءات' : 'Actions',
    noStations: language === 'ar' ? 'لا توجد محطات مضافة' : 'No stations added',
    latitude: language === 'ar' ? 'خط العرض' : 'Latitude',
    longitude: language === 'ar' ? 'خط الطول' : 'Longitude',
    duplicateStation: language === 'ar' ? 'محطة مكررة: يوجد محطة أخرى بنفس الاسم أو في نفس الموقع الجغرافي تقريبًا' : 'Duplicate station: There is another station with the same name or approximately the same geographic location',
    page: language === 'ar' ? 'صفحة' : 'Page',
    of: language === 'ar' ? 'من' : 'of',
    previous: language === 'ar' ? 'السابق' : 'Previous',
    next: language === 'ar' ? 'التالي' : 'Next',
    search: language === 'ar' ? 'بحث عن محطة...' : 'Search for a station...',
    noResults: language === 'ar' ? 'لا توجد نتائج مطابقة للبحث' : 'No matching results found',
  };

  // استخدام debounce للبحث لتحسين الأداء
  const [searchInputTerm, setSearchInputTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchInputTerm, 300);

  // تم استيراد وظائف معالجة النصوص مباشرة في الأعلى

  // تطبيق البحث على المحطات - تم تحسينه للأداء والحساسية
  const filterStations = useCallback((stationsList: GasStation[], term: string) => {
    if (!term.trim()) return stationsList;

    // تحسين البحث باستخدام وظيفة textContains التي تتجاهل الحالة والتشكيل
    return stationsList.filter(station => {
      // البحث في جميع الحقول المهمة
      return (
        textContains(station.name, term) ||
        textContains(station.region, term) ||
        textContains(station.sub_region, term) ||
        textContains(station.fuel_types, term) ||
        // إضافة البحث في الإحداثيات كنص
        textContains(String(station.latitude), term) ||
        textContains(String(station.longitude), term) ||
        // البحث في المعلومات الإضافية
        textContains(station.additional_info, term)
      );
    });
  }, []);

  // تحسين أداء البحث باستخدام useMemo
  const searchResults = useMemo(() => {
    return filterStations(stations, debouncedSearchTerm);
  }, [filterStations, stations, debouncedSearchTerm]);

  // تطبيق البحث عند تغيير مصطلح البحث المؤجل
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
    setFilteredStations(searchResults);
    // إعادة تعيين الصفحة الحالية إلى 1 عند تغيير نتائج البحث
    setCurrentPage(1);
  }, [debouncedSearchTerm, searchResults]);

  // تحديث المحطات المعروضة عند تغيير الصفحة أو قائمة المحطات المفلترة
  useEffect(() => {
    const stationsToShow = filteredStations.length > 0 ? filteredStations : stations;
    const totalPagesCount = Math.ceil(stationsToShow.length / itemsPerPage);

    // تأكد من أن الصفحة الحالية ليست أكبر من إجمالي عدد الصفحات
    const validCurrentPage = Math.min(currentPage, Math.max(1, totalPagesCount));
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }

    const indexOfLastItem = validCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    setPaginatedStations(stationsToShow.slice(indexOfFirstItem, indexOfLastItem));
    setTotalPages(totalPagesCount);

    // طباعة معلومات التصحيح
    console.log(`Total stations: ${stationsToShow.length}, Pages: ${totalPagesCount}, Current page: ${validCurrentPage}`);
  }, [currentPage, filteredStations, stations, itemsPerPage]);

  // التحقق من المحطات المكررة
  useEffect(() => {
    const checkDuplicates = async () => {
      try {
        if (stations.length > 0) {
          const duplicates = await checkDuplicateStationsInList(stations);
          setDuplicateStations(duplicates);
        }
      } catch (error) {
        console.error("Error checking for duplicate stations:", error);
      }
    };

    checkDuplicates();
  }, [stations]);

  // التنقل بين الصفحات
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* حقل البحث محسن */}
        <div className="relative">
          <Input
            placeholder={tableTexts.search}
            value={searchInputTerm}
            onChange={(e) => setSearchInputTerm(e.target.value)}
            className="pl-10 pr-10 transition-all duration-200 border-noor-purple/30 focus:border-noor-purple"
            autoComplete="off"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          {/* زر مسح البحث */}
          {searchInputTerm && (
            <button
              onClick={() => setSearchInputTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="مسح البحث"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>
          )}

          {/* عرض عدد النتائج */}
          {searchTerm && (
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="bg-noor-purple/10 text-noor-purple border-noor-purple/20">
                {filteredStations.length} {language === 'ar' ? 'نتيجة' : 'results'}
              </Badge>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">{tableTexts.id}</TableHead>
                <TableHead>{tableTexts.name}</TableHead>
                <TableHead>{tableTexts.region}</TableHead>
                <TableHead>{tableTexts.subRegion}</TableHead>
                <TableHead className="hidden md:table-cell">{tableTexts.fuelTypes}</TableHead>
                <TableHead className="text-center">{tableTexts.coordinates}</TableHead>
                <TableHead className="text-right">{tableTexts.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {tableTexts.noStations}
                  </TableCell>
                </TableRow>
              ) : paginatedStations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {tableTexts.noResults}
                  </TableCell>
                </TableRow>
              ) : (
              paginatedStations.map((station, index) => (
                <TableRow
                  key={station.id}
                  className={duplicateStations.get(station.id) ? "bg-amber-50" : ""}
                >
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {station.name}
                      {duplicateStations.get(station.id) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle size={16} className="text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-amber-100 text-amber-800 border-amber-200">
                            <p>{tableTexts.duplicateStation}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{station.region}</TableCell>
                  <TableCell>{station.sub_region}</TableCell>
                  <TableCell className="hidden md:table-cell">{station.fuel_types || "-"}</TableCell>
                  <TableCell className="text-center text-xs">
                    <div>{tableTexts.latitude}: {station.latitude}</div>
                    <div>{tableTexts.longitude}: {station.longitude}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {duplicateStations.get(station.id) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
                              <AlertTriangle size={16} className="text-amber-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-amber-100 text-amber-800 border-amber-200">
                            <p>{tableTexts.duplicateStation}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(station)}
                      >
                        <Edit size={16} className="text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(station)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* إضافة التنقل بين الصفحات - تم تحسينه */}
        {stations.length > 0 && (
          <div className="mt-4 flex flex-col items-center py-4">
            <Pagination className="bg-white shadow-sm rounded-lg p-2">
              <PaginationContent className="flex-wrap gap-1 max-w-full overflow-x-auto py-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} bg-noor-purple/5 hover:bg-noor-purple/10`}
                  >
                    {tableTexts.previous}
                  </PaginationPrevious>
                </PaginationItem>

                {/* عرض أرقام الصفحات مع تحسين للعرض */}
                {totalPages > 0 && (
                  <>
                    {/* زر الصفحة الأولى */}
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(1)}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 4 && (
                          <PaginationItem>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {/* الصفحات المحيطة بالصفحة الحالية */}
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      // عرض الصفحات القريبة من الصفحة الحالية فقط
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              isActive={currentPage === pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={currentPage === pageNumber ? 'bg-noor-purple text-white hover:bg-noor-purple/90' : 'hover:bg-noor-purple/10'}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // إضافة نقاط للصفحات المحذوفة
                      if (
                        (pageNumber === currentPage - 3 && pageNumber > 2) ||
                        (pageNumber === currentPage + 3 && pageNumber < totalPages - 1)
                      ) {
                        return (
                          <PaginationItem key={`ellipsis-${pageNumber}`}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }

                      return null;
                    })}
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} bg-noor-purple/5 hover:bg-noor-purple/10`}
                  >
                    {tableTexts.next}
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-muted-foreground mt-2">
              {tableTexts.page} {currentPage} {tableTexts.of} {totalPages}
              <span className="mx-2">|</span>
              {language === 'ar'
                ? `إجمالي المحطات: ${filteredStations.length > 0 ? filteredStations.length : stations.length}`
                : `Total stations: ${filteredStations.length > 0 ? filteredStations.length : stations.length}`}
            </div>
          </div>
        )}
      </div>
      </div>
    </TooltipProvider>
  );
};

export default StationsTable;
