import { supabase } from "@/integrations/supabase/client";
import { SaudiCity } from "@/types/station";

/**
 * إضافة مدينة جديدة إلى قاعدة البيانات
 * @param cityData بيانات المدينة الجديدة
 * @returns وعد بنتيجة الإضافة
 */
export const addCity = async (cityData: {
  name_ar: string;
  name_en: string;
  latitude: number;
  longitude: number;
  zoom?: number;
}): Promise<SaudiCity> => {
  try {
    // الحصول على رمز المصادقة الحالي
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("غير مصرح: يجب تسجيل الدخول لإضافة مدينة جديدة");
    }

    // محاولة إضافة المدينة إلى قاعدة البيانات
    try {
      console.log("محاولة إضافة المدينة إلى قاعدة البيانات...");

      const { data, error } = await supabase
        .from("cities")
        .insert({
          name_ar: cityData.name_ar,
          name_en: cityData.name_en,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          zoom: cityData.zoom || 10,
        })
        .select()
        .single();

      if (error) {
        console.warn("فشلت إضافة المدينة إلى قاعدة البيانات:", error);
        throw error;
      }

      console.log("تمت إضافة المدينة بنجاح إلى قاعدة البيانات");
      return {
        name: data.name_ar,
        nameEn: data.name_en,
        latitude: data.latitude,
        longitude: data.longitude,
        zoom: data.zoom || 10,
      };
    } catch (dbError) {
      console.error("فشلت إضافة المدينة إلى قاعدة البيانات:", dbError);

      // إذا فشلت الإضافة إلى قاعدة البيانات، نرجع المدينة كما هي (للإضافة المحلية)
      console.log("إرجاع المدينة للإضافة المحلية");
      return {
        name: cityData.name_ar,
        nameEn: cityData.name_en,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        zoom: cityData.zoom || 10,
      };
    }
  } catch (error) {
    console.error("Error adding city:", error);
    throw error;
  }
};

/**
 * الحصول على قائمة المدن من قاعدة البيانات
 * @returns وعد بقائمة المدن
 */
export const fetchCities = async (): Promise<SaudiCity[]> => {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name_ar", { ascending: true });

    if (error) {
      throw error;
    }

    // تحويل البيانات إلى تنسيق SaudiCity
    return data.map((city) => ({
      name: city.name_ar,
      nameEn: city.name_en,
      latitude: city.latitude,
      longitude: city.longitude,
      zoom: city.zoom || 10,
    }));
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
};

/**
 * الحصول على قائمة المدن الافتراضية
 * @returns قائمة المدن الافتراضية
 */
export const getDefaultCities = (): SaudiCity[] => {
  return [
    { name: 'الرياض', nameEn: 'Riyadh', latitude: 24.7136, longitude: 46.6753, zoom: 10 },
    { name: 'جدة', nameEn: 'Jeddah', latitude: 21.4858, longitude: 39.1925, zoom: 10 },
    { name: 'مكة المكرمة', nameEn: 'Mecca', latitude: 21.3891, longitude: 39.8579, zoom: 10 },
    { name: 'المدينة المنورة', nameEn: 'Medina', latitude: 24.5247, longitude: 39.5692, zoom: 10 },
    { name: 'الدمام', nameEn: 'Dammam', latitude: 26.4207, longitude: 50.0888, zoom: 10 },
    { name: 'الخبر', nameEn: 'Khobar', latitude: 26.2172, longitude: 50.1971, zoom: 10 },
    { name: 'الطائف', nameEn: 'Taif', latitude: 21.2886, longitude: 40.4164, zoom: 10 },
    { name: 'تبوك', nameEn: 'Tabuk', latitude: 28.3998, longitude: 36.5714, zoom: 10 },
    { name: 'بريدة', nameEn: 'Buraidah', latitude: 26.3260, longitude: 43.9750, zoom: 10 },
    { name: 'خميس مشيط', nameEn: 'Khamis Mushait', latitude: 18.3000, longitude: 42.7333, zoom: 10 },
    { name: 'أبها', nameEn: 'Abha', latitude: 18.2164, longitude: 42.5053, zoom: 10 },
    { name: 'حائل', nameEn: 'Hail', latitude: 27.5219, longitude: 41.6957, zoom: 10 },
    { name: 'نجران', nameEn: 'Najran', latitude: 17.4922, longitude: 44.1277, zoom: 10 },
    { name: 'جازان', nameEn: 'Jazan', latitude: 16.8892, longitude: 42.5611, zoom: 10 },
    { name: 'الجبيل', nameEn: 'Jubail', latitude: 27.0174, longitude: 49.6622, zoom: 10 },
  ];
};
