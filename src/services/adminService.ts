import { createClient } from '@supabase/supabase-js';
import { SaudiCity } from "@/types/station";

// معلومات المشروع
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jtnqcyouncjoebqcalzh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bnFjeW91bmNqb2VicWNhbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTkyMTIsImV4cCI6MjA2MTA5NTIxMn0.VWK5DvW4LxFDLZ-RYaQXDABUaPM8y2vGFnXgKwGZ9Dk';

// إنشاء عميل Supabase باستخدام مفتاح العام
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * إضافة مدينة جديدة إلى قاعدة البيانات باستخدام SQL مباشر
 * @param cityData بيانات المدينة الجديدة
 * @param token رمز المصادقة للمستخدم
 * @returns وعد بنتيجة الإضافة
 */
export const addCityDirectSQL = async (
  cityData: {
    name_ar: string;
    name_en: string;
    latitude: number;
    longitude: number;
    zoom?: number;
  },
  token: string
): Promise<SaudiCity> => {
  try {
    // التحقق من وجود رمز المصادقة
    if (!token) {
      throw new Error("غير مصرح: يجب تسجيل الدخول لإضافة مدينة جديدة");
    }

    // تعيين رمز المصادقة للجلسة
    supabaseAdmin.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    // استعلام SQL لإضافة المدينة مباشرة
    const sql = `
      INSERT INTO cities (name_ar, name_en, latitude, longitude, zoom)
      VALUES ('${cityData.name_ar}', '${cityData.name_en}', ${cityData.latitude}, ${cityData.longitude}, ${cityData.zoom || 10})
      RETURNING *;
    `;

    // تنفيذ الاستعلام
    const { data, error } = await supabaseAdmin.rpc('pgexec', { sql });

    if (error) {
      console.error("خطأ في تنفيذ استعلام SQL:", error);
      throw new Error(`فشل في إضافة المدينة: ${error.message}`);
    }

    // استخراج البيانات من النتيجة
    const result = data && data.length > 0 ? JSON.parse(data[0]) : null;
    
    if (!result || !result.length) {
      throw new Error("لم يتم إرجاع أي بيانات من الاستعلام");
    }

    const cityResult = result[0];

    // تحويل البيانات إلى تنسيق SaudiCity
    return {
      name: cityResult.name_ar,
      nameEn: cityResult.name_en,
      latitude: cityResult.latitude,
      longitude: cityResult.longitude,
      zoom: cityResult.zoom || 10,
    };
  } catch (error) {
    console.error("Error adding city with direct SQL:", error);
    throw error;
  }
};

/**
 * إضافة مدينة جديدة إلى قاعدة البيانات باستخدام API مباشر
 * @param cityData بيانات المدينة الجديدة
 * @param token رمز المصادقة للمستخدم
 * @returns وعد بنتيجة الإضافة
 */
export const addCityDirect = async (
  cityData: {
    name_ar: string;
    name_en: string;
    latitude: number;
    longitude: number;
    zoom?: number;
  },
  token: string
): Promise<SaudiCity> => {
  try {
    // التحقق من وجود رمز المصادقة
    if (!token) {
      throw new Error("غير مصرح: يجب تسجيل الدخول لإضافة مدينة جديدة");
    }

    // تعيين رمز المصادقة للجلسة
    supabaseAdmin.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    // إضافة المدينة مباشرة باستخدام API
    const { data, error } = await supabaseAdmin
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
      console.error("خطأ في إضافة المدينة مباشرة:", error);
      throw new Error(`فشل في إضافة المدينة: ${error.message}`);
    }

    // تحويل البيانات إلى تنسيق SaudiCity
    return {
      name: data.name_ar,
      nameEn: data.name_en,
      latitude: data.latitude,
      longitude: data.longitude,
      zoom: data.zoom || 10,
    };
  } catch (error) {
    console.error("Error adding city directly:", error);
    throw error;
  }
};
