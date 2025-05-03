
import { supabase } from "@/integrations/supabase/client";
import { GasStation } from "@/types/station";
import { checkDuplicateStation } from "./duplicateDetection";

// جلب المحطات
export const fetchStations = async (): Promise<GasStation[]> => {
  try {
    const { data, error } = await supabase
      .from("stations")
      .select("*");

    if (error) {
      console.error("Error fetching stations:", error);
      throw error;
    }

    return data as GasStation[];
  } catch (err) {
    console.error("Error in fetchStations:", err);
    throw new Error(err instanceof Error ? err.message : "Unknown error fetching stations");
  }
};

// جلب المحطات حسب المنطقة
export const fetchStationsByRegion = async (region: string): Promise<GasStation[]> => {
  try {
    if (region === 'all') {
      return fetchStations();
    }

    const { data, error } = await supabase
      .from("stations")
      .select("*")
      .eq("region", region);

    if (error) {
      console.error(`Error fetching stations for region ${region}:`, error);
      throw error;
    }

    return data as GasStation[];
  } catch (err) {
    console.error("Error in fetchStationsByRegion:", err);
    throw new Error(err instanceof Error ? err.message : `Unknown error fetching stations for region ${region}`);
  }
};

// جلب محطة معينة
export const fetchStation = async (id: string): Promise<GasStation> => {
  try {
    const { data, error } = await supabase
      .from("stations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching station with id ${id}:`, error);
      throw error;
    }

    return data as GasStation;
  } catch (err) {
    console.error("Error in fetchStation:", err);
    throw new Error(err instanceof Error ? err.message : `Unknown error fetching station with ID: ${id}`);
  }
};

// جلب جميع المدن
export const fetchCities = async () => {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*");

    if (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in fetchCities:", err);
    throw new Error(err instanceof Error ? err.message : "Unknown error fetching cities");
  }
};

// جلب المحطات بناءً على المدينة
export const fetchStationsByCity = async (cityName: string): Promise<GasStation[]> => {
  try {
    if (!cityName || cityName === '') {
      return [];
    }

    const { data, error } = await supabase
      .from("stations")
      .select("*")
      .eq("region", cityName);

    if (error) {
      console.error(`Error fetching stations for city ${cityName}:`, error);
      throw error;
    }

    return data as GasStation[];
  } catch (err) {
    console.error("Error in fetchStationsByCity:", err);
    throw new Error(err instanceof Error ? err.message : `Unknown error fetching stations for city ${cityName}`);
  }
};

// إضافة محطة جديدة
export const addStation = async (station: Omit<GasStation, "id">, skipDuplicateCheck: boolean = false): Promise<GasStation> => {
  // تحقق أن المستخدم مسجل الدخول قبل السماح بالإضافة
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error("You must be logged in as an admin to add stations");
  }

  // Check if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .single();

  if (adminError || !adminData) {
    throw new Error("You must be an admin to add stations");
  }

  // التحقق من وجود محطة مكررة (إلا إذا تم تجاوز التحقق)
  console.log(`إضافة محطة: ${station.name}, تجاوز التحقق: ${skipDuplicateCheck}`);

  if (!skipDuplicateCheck) {
    console.log(`جاري التحقق من المحطات المكررة لـ: ${station.name}`);
    const { isDuplicate, duplicateStation } = await checkDuplicateStation(
      station.name,
      station.latitude,
      station.longitude
    );

    if (isDuplicate) {
      console.log(`تم العثور على محطة مكررة: ${duplicateStation?.name} (ID: ${duplicateStation?.id})`);
      throw new Error(`محطة مكررة: ${duplicateStation?.name} (ID: ${duplicateStation?.id})`);
    } else {
      console.log(`لم يتم العثور على محطات مكررة لـ: ${station.name}`);
    }
  } else {
    console.log(`تم تجاوز التحقق من المحطات المكررة لـ: ${station.name}`);
  }

  try {
    // تعديل الاستعلام لعدم استخدام single() لتجنب خطأ "multiple rows returned"
    const { data, error } = await supabase
      .from("stations")
      .insert(station)
      .select();

    if (error) {
      console.error("Error adding station:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("لم يتم إرجاع أي بيانات بعد إضافة المحطة");
    }

    console.log(`تمت إضافة المحطة بنجاح: ${station.name}, ID: ${data[0].id}`);
    return data[0] as GasStation;
  } catch (error) {
    console.error(`خطأ في إضافة المحطة ${station.name}:`, error);
    throw error;
  }
};

// تحديث محطة
export const updateStation = async (
  id: string,
  station: Partial<GasStation>
): Promise<GasStation> => {
  // تحقق أن المستخدم مسجل الدخول قبل السماح بالتحديث
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error("You must be logged in as an admin to update stations");
  }

  // Check if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .single();

  if (adminError || !adminData) {
    throw new Error("You must be an admin to update stations");
  }

  try {
    // تعديل الاستعلام لعدم استخدام single() لتجنب خطأ "multiple rows returned"
    const { data, error } = await supabase
      .from("stations")
      .update(station)
      .eq("id", id)
      .select();

    if (error) {
      console.error(`Error updating station with id ${id}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`لم يتم العثور على محطة بالمعرف ${id}`);
    }

    console.log(`تم تحديث المحطة بنجاح: ${data[0].name}, ID: ${data[0].id}`);
    return data[0] as GasStation;
  } catch (error) {
    console.error(`خطأ في تحديث المحطة بالمعرف ${id}:`, error);
    throw error;
  }
};

// حذف محطة
export const deleteStation = async (id: string): Promise<void> => {
  // تحقق أن المستخدم مسجل الدخول قبل السماح بالحذف
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error("You must be logged in as an admin to delete stations");
  }

  // Check if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .single();

  if (adminError || !adminData) {
    throw new Error("You must be an admin to delete stations");
  }

  const { error } = await supabase.from("stations").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting station with id ${id}:`, error);
    throw error;
  }
};
