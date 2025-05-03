
import { supabase } from "@/integrations/supabase/client";
import { GasStation } from "@/types/station";
import { calculateDistance } from "./geolocation";
import { deleteStation } from "./stationManagement";

// التحقق من وجود محطة مكررة
export const checkDuplicateStation = async (
  name: string,
  latitude: number,
  longitude: number
): Promise<{ isDuplicate: boolean; duplicateStation?: GasStation; duplicateType?: 'name' | 'location' }> => {
  try {
    // البحث عن محطة بنفس الاسم
    const { data: nameData, error: nameError } = await supabase
      .from("stations")
      .select("*")
      .eq("name", name)
      .maybeSingle();

    if (nameError) throw nameError;

    // إذا وجدنا محطة بنفس الاسم، نعيدها كمحطة مكررة
    if (nameData) {
      return { 
        isDuplicate: true, 
        duplicateStation: nameData as GasStation,
        duplicateType: 'name' 
      };
    }

    // البحث عن محطة قريبة جدًا من نفس الموقع الجغرافي (بمسافة 100 متر)
    // نستخدم معادلة هافرسين لحساب المسافة بين نقطتين على سطح الأرض
    const { data: locationData, error: locationError } = await supabase
      .rpc('find_nearest_stations', {
        lat: latitude,
        lng: longitude,
        limit_count: 1
      });

    if (locationError) throw locationError;

    // إذا وجدنا محطة قريبة جدًا (أقل من 100 متر)، نعتبرها مكررة
    if (locationData && locationData.length > 0 && locationData[0].distance_meters < 100) {
      return { 
        isDuplicate: true, 
        duplicateStation: locationData[0] as GasStation,
        duplicateType: 'location' 
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("Error checking for duplicate station:", error);
    throw error;
  }
};

// التحقق من المحطات المكررة في قائمة المحطات
export const checkDuplicateStationsInList = async (stations: GasStation[]): Promise<Map<string, boolean>> => {
  try {
    // إنشاء خريطة لتخزين حالة التكرار لكل محطة
    const duplicateMap = new Map<string, boolean>();

    // تهيئة جميع المحطات كغير مكررة
    stations.forEach(station => {
      duplicateMap.set(station.id, false);
    });

    // التحقق من كل محطة
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];

      // تخطي المحطات التي تم تحديدها بالفعل كمكررة
      if (duplicateMap.get(station.id)) continue;

      // البحث عن محطات بنفس الاسم
      const sameNameStations = stations.filter(s =>
        s.id !== station.id && s.name.toLowerCase() === station.name.toLowerCase()
      );

      if (sameNameStations.length > 0) {
        duplicateMap.set(station.id, true);
        sameNameStations.forEach(s => duplicateMap.set(s.id, true));
        continue;
      }

      // البحث عن محطات قريبة جدًا (أقل من 100 متر)
      for (let j = i + 1; j < stations.length; j++) {
        const otherStation = stations[j];

        // حساب المسافة بين المحطتين باستخدام معادلة هافرسين
        const distance = calculateDistance(
          station.latitude, station.longitude,
          otherStation.latitude, otherStation.longitude
        ) * 1000; // تحويل من كيلومتر إلى متر

        // إذا كانت المسافة أقل من 100 متر، نعتبرهما مكررتين
        if (distance < 100) {
          duplicateMap.set(station.id, true);
          duplicateMap.set(otherStation.id, true);
        }
      }
    }

    return duplicateMap;
  } catch (error) {
    console.error("Error checking for duplicate stations:", error);
    throw error;
  }
};

/**
 * حذف المحطات المكررة تلقائيًا
 * @param stations قائمة المحطات
 * @returns معلومات عن عملية الحذف
 */
export const deleteDuplicateStations = async (stations: GasStation[]): Promise<{
  deleted: number;
  errors: string[];
  remainingStations: GasStation[];
}> => {
  try {
    const result = { deleted: 0, errors: [] as string[], remainingStations: [] as GasStation[] };

    // الحصول على خريطة المحطات المكررة
    const duplicateMap = await checkDuplicateStationsInList(stations);

    // تجميع المحطات المكررة في مجموعات
    const duplicateGroups: Map<string, GasStation[]> = new Map();

    // تجميع المحطات المكررة حسب الاسم
    stations.forEach(station => {
      if (duplicateMap.get(station.id)) {
        const key = station.name.toLowerCase();
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key)?.push(station);
      }
    });

    // تجميع المحطات المكررة حسب الموقع الجغرافي
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      if (duplicateMap.get(station.id)) {
        // تخطي المحطات التي تم تجميعها بالفعل حسب الاسم
        if (duplicateGroups.has(station.name.toLowerCase())) continue;

        const locationKey = `${station.latitude.toFixed(4)}_${station.longitude.toFixed(4)}`;
        if (!duplicateGroups.has(locationKey)) {
          duplicateGroups.set(locationKey, []);
        }

        // إضافة المحطة الحالية
        duplicateGroups.get(locationKey)?.push(station);

        // البحث عن محطات قريبة جدًا
        for (let j = i + 1; j < stations.length; j++) {
          const otherStation = stations[j];
          if (duplicateMap.get(otherStation.id)) {
            const distance = calculateDistance(
              station.latitude, station.longitude,
              otherStation.latitude, otherStation.longitude
            ) * 1000; // تحويل من كيلومتر إلى متر

            if (distance < 100) {
              duplicateGroups.get(locationKey)?.push(otherStation);
            }
          }
        }
      }
    }

    // حذف المحطات المكررة مع الاحتفاظ بأقدم محطة في كل مجموعة
    for (const [_, group] of duplicateGroups) {
      if (group.length <= 1) continue;

      // ترتيب المحطات حسب تاريخ الإنشاء (الأقدم أولاً)
      group.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });

      // الاحتفاظ بأقدم محطة
      const stationToKeep = group[0];
      result.remainingStations.push(stationToKeep);

      // حذف باقي المحطات المكررة
      for (let i = 1; i < group.length; i++) {
        try {
          await deleteStation(group[i].id);
          result.deleted++;
        } catch (error) {
          result.errors.push(`فشل في حذف المحطة ${group[i].name} (${group[i].id}): ${(error as Error).message}`);
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error deleting duplicate stations:", error);
    throw error;
  }
};
