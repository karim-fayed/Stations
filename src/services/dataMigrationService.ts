/**
 * خدمة ترحيل البيانات
 * تستخدم لترحيل البيانات من التطبيق إلى قاعدة البيانات
 */

import { supabase } from "@/integrations/supabase/client";
import { fetchStations } from "./stationService";
import { fetchCities } from "./cityService";
import logger from "@/utils/logger";

/**
 * ترحيل بيانات المحطات إلى قاعدة البيانات
 * @param progressCallback دالة لتحديث نسبة التقدم
 * @returns وعد بنتائج الترحيل
 */
export const migrateStationsData = async (
  progressCallback?: (progress: number, stage: string) => void
): Promise<{
  success: boolean;
  message: string;
  details?: {
    total: number;
    migrated: number;
    failed: number;
    errors: string[];
  };
}> => {
  try {
    logger.debug("بدء ترحيل بيانات المحطات...");

    // إرسال تحديث التقدم: 0%
    if (progressCallback) {
      progressCallback(0, "جلب بيانات المحطات");
    }

    // جلب جميع المحطات من قاعدة البيانات
    const stations = await fetchStations();

    if (!stations || stations.length === 0) {
      return {
        success: false,
        message: "لا توجد محطات لترحيلها",
      };
    }

    // إحصائيات الترحيل
    const migrationStats = {
      total: stations.length,
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // إرسال تحديث التقدم: 10%
    if (progressCallback) {
      progressCallback(10, "بدء ترحيل المحطات");
    }

    // ترحيل كل محطة
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      try {
        // تحديث المحطة في قاعدة البيانات
        const { error } = await supabase
          .from("stations")
          .update({
            name: station.name,
            region: station.region,
            sub_region: station.sub_region,
            latitude: station.latitude,
            longitude: station.longitude,
            fuel_types: station.fuel_types,
            additional_info: station.additional_info,
            updated_at: new Date().toISOString(),
          })
          .eq("id", station.id);

        if (error) {
          throw error;
        }

        migrationStats.migrated++;
      } catch (error) {
        migrationStats.failed++;
        migrationStats.errors.push(`فشل ترحيل المحطة ${station.name}: ${(error as Error).message}`);
        logger.error(`فشل ترحيل المحطة ${station.name}:`, error);
      }

      // تحديث نسبة التقدم (من 10% إلى 50%)
      if (progressCallback) {
        const progress = 10 + Math.floor((i + 1) / stations.length * 40);
        progressCallback(progress, "ترحيل المحطات");
      }
    }

    logger.debug(`اكتمل ترحيل المحطات: ${migrationStats.migrated}/${migrationStats.total} بنجاح`);

    return {
      success: migrationStats.migrated > 0,
      message: `تم ترحيل ${migrationStats.migrated} من أصل ${migrationStats.total} محطة بنجاح`,
      details: migrationStats,
    };
  } catch (error) {
    logger.error("خطأ في ترحيل بيانات المحطات:", error);
    return {
      success: false,
      message: `فشل ترحيل البيانات: ${(error as Error).message}`,
    };
  }
};

/**
 * ترحيل بيانات المدن (المناطق) إلى قاعدة البيانات
 * @param progressCallback دالة لتحديث نسبة التقدم
 * @returns وعد بنتائج الترحيل
 */
export const migrateCitiesData = async (
  progressCallback?: (progress: number, stage: string) => void
): Promise<{
  success: boolean;
  message: string;
  details?: {
    total: number;
    migrated: number;
    failed: number;
    errors: string[];
  };
}> => {
  try {
    logger.debug("بدء ترحيل بيانات المدن...");

    // إرسال تحديث التقدم: 50%
    if (progressCallback) {
      progressCallback(50, "جلب بيانات المناطق");
    }

    // جلب جميع المدن (المناطق) من قاعدة البيانات
    const cities = await fetchCities();

    if (!cities || cities.length === 0) {
      return {
        success: false,
        message: "لا توجد مناطق لترحيلها",
      };
    }

    // إحصائيات الترحيل
    const migrationStats = {
      total: cities.length,
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // إرسال تحديث التقدم: 60%
    if (progressCallback) {
      progressCallback(60, "بدء ترحيل المناطق");
    }

    // ترحيل كل مدينة (منطقة)
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      try {
        // البحث عن المدينة في قاعدة البيانات
        const { data: existingCity, error: findError } = await supabase
          .from("cities")
          .select("id")
          .eq("name_ar", city.name)
          .eq("name_en", city.nameEn)
          .single();

        if (findError && findError.code !== "PGRST116") {
          throw findError;
        }

        if (existingCity) {
          // تحديث المدينة الموجودة
          const { error: updateError } = await supabase
            .from("cities")
            .update({
              latitude: city.latitude,
              longitude: city.longitude,
              zoom: city.zoom || 10,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingCity.id);

          if (updateError) {
            throw updateError;
          }
        } else {
          // إضافة مدينة جديدة
          const { error: insertError } = await supabase
            .from("cities")
            .insert({
              name_ar: city.name,
              name_en: city.nameEn,
              latitude: city.latitude,
              longitude: city.longitude,
              zoom: city.zoom || 10,
            });

          if (insertError) {
            throw insertError;
          }
        }

        migrationStats.migrated++;
      } catch (error) {
        migrationStats.failed++;
        migrationStats.errors.push(`فشل ترحيل المنطقة ${city.name}: ${(error as Error).message}`);
        logger.error(`فشل ترحيل المنطقة ${city.name}:`, error);
      }

      // تحديث نسبة التقدم (من 60% إلى 90%)
      if (progressCallback) {
        const progress = 60 + Math.floor((i + 1) / cities.length * 30);
        progressCallback(progress, "ترحيل المناطق");
      }
    }

    logger.debug(`اكتمل ترحيل المدن: ${migrationStats.migrated}/${migrationStats.total} بنجاح`);

    return {
      success: migrationStats.migrated > 0,
      message: `تم ترحيل ${migrationStats.migrated} من أصل ${migrationStats.total} مدينة بنجاح`,
      details: migrationStats,
    };
  } catch (error) {
    logger.error("خطأ في ترحيل بيانات المدن:", error);
    return {
      success: false,
      message: `فشل ترحيل البيانات: ${(error as Error).message}`,
    };
  }
};

/**
 * ترحيل جميع البيانات إلى قاعدة البيانات
 * @param progressCallback دالة لتحديث نسبة التقدم
 * @returns وعد بنتائج الترحيل
 */
export const migrateAllData = async (
  progressCallback?: (progress: number, stage: string) => void
): Promise<{
  success: boolean;
  message: string;
  stations: {
    success: boolean;
    message: string;
  };
  cities: {
    success: boolean;
    message: string;
  };
}> => {
  try {
    logger.debug("بدء ترحيل جميع البيانات...");

    // إرسال تحديث التقدم: بدء العملية
    if (progressCallback) {
      progressCallback(0, "بدء عملية الترحيل");
    }

    // ترحيل المحطات (0% - 50%)
    const stationsResult = await migrateStationsData(progressCallback);

    // ترحيل المدن (50% - 90%)
    const citiesResult = await migrateCitiesData(progressCallback);

    // إرسال تحديث التقدم: اكتمال العملية
    if (progressCallback) {
      progressCallback(100, "اكتملت عملية الترحيل");
    }

    // تحديد نجاح العملية الكلية
    const success = stationsResult.success || citiesResult.success;

    return {
      success,
      message: success
        ? "تم ترحيل البيانات بنجاح"
        : "فشل ترحيل البيانات",
      stations: {
        success: stationsResult.success,
        message: stationsResult.message,
      },
      cities: {
        success: citiesResult.success,
        message: citiesResult.message,
      },
    };
  } catch (error) {
    logger.error("خطأ في ترحيل جميع البيانات:", error);
    return {
      success: false,
      message: `فشل ترحيل البيانات: ${(error as Error).message}`,
      stations: {
        success: false,
        message: "لم يتم ترحيل المحطات",
      },
      cities: {
        success: false,
        message: "لم يتم ترحيل المدن",
      },
    };
  }
};
