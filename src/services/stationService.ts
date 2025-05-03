
import { supabase } from "@/integrations/supabase/client";
import { GasStation } from "@/types/station";

// جلب المحطات
export const fetchStations = async (): Promise<GasStation[]> => {
  const { data, error } = await supabase
    .from("stations")
    .select("*");

  if (error) {
    console.error("Error fetching stations:", error);
    throw error;
  }

  return data as GasStation[];
};

// جلب المحطات حسب المنطقة
export const fetchStationsByRegion = async (region: string): Promise<GasStation[]> => {
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
};

// جلب محطة معينة
export const fetchStation = async (id: string): Promise<GasStation> => {
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
};

// التحقق من وجود محطة مكررة
export const checkDuplicateStation = async (
  name: string,
  latitude: number,
  longitude: number
): Promise<{ isDuplicate: boolean; duplicateStation?: GasStation }> => {
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
      return { isDuplicate: true, duplicateStation: nameData as GasStation };
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
      return { isDuplicate: true, duplicateStation: locationData[0] as GasStation };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("Error checking for duplicate station:", error);
    throw error;
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

// جلب أقرب محطات
export const fetchNearestStations = async (
  latitude: number,
  longitude: number,
  limit: number = 5
): Promise<GasStation[]> => {
  try {
    // Get all stations first
    const { data, error } = await supabase.from("stations").select("*");

    if (error) throw error;

    // Calculate distance for each station (in meters) - Haversine formula
    const stations = data.map((station) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude
      );
      return { ...station, distance_meters: Math.round(distance * 1000) };
    });

    // Sort stations by distance
    stations.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));

    return stations.slice(0, limit) as GasStation[];
  } catch (error) {
    console.error("Error fetching nearest stations:", error);
    throw error;
  }
};

// دالة حساب المسافة - Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // المسافة بالكيلومتر
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// إرسال رابط تسجيل دخول سحري للمستخدم المشرف
export const sendMagicLink = async (email: string) => {
  // إزالة المسافات من البريد الإلكتروني
  const trimmedEmail = email.trim();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
  });

  if (error) {
    console.error("Error sending magic link:", error);
    throw error;
  }

  return data;
};

export const adminLogout = async () => {
  try {
    // نهج جديد لتسجيل الخروج بدون استخدام scope=global

    // 1. مسح بيانات الجلسة من localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('sb-') ||
        key.startsWith('supabase.') ||
        key.includes('auth')
      )) {
        console.log(`Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
        // نعيد ضبط i لأن طول localStorage قد تغير
        i--;
      }
    }

    // 2. مسح بيانات الجلسة من sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('sb-') ||
        key.startsWith('supabase.') ||
        key.includes('auth')
      )) {
        console.log(`Removing sessionStorage item: ${key}`);
        sessionStorage.removeItem(key);
        // نعيد ضبط i لأن طول sessionStorage قد تغير
        i--;
      }
    }

    // 3. مسح بيانات الجلسة المعروفة بشكل صريح
    localStorage.removeItem('sb-jtnqcyouncjoebqcalzh-auth-token');
    sessionStorage.removeItem('sb-jtnqcyouncjoebqcalzh-auth-token');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');

    // 4. إعادة تعيين حالة Supabase client
    // نستخدم هذا الأسلوب بدلاً من signOut لتجنب خطأ 403
    try {
      // إعادة تهيئة Supabase client
      await supabase.auth.initialize();

      // التحقق من أن المستخدم قد تم تسجيل خروجه
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.warn("Session still exists after logout attempt");
      } else {
        console.log("Successfully logged out");
      }
    } catch (initError) {
      console.warn("Error reinitializing Supabase client:", initError);
    }

    console.log("تم تسجيل الخروج بنجاح");
    return true;
  } catch (error) {
    console.error("Exception during logout:", error);
    // حتى لو فشل تسجيل الخروج، نعتبر أن المستخدم قد سجل خروجه
    return true;
  }
};

export const checkAdminStatus = async () => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  // Check if the user is an admin in the admin_users table
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', data.session.user.id)
    .single();

  return {
    isAuthenticated: !!data.session && !!adminData,
    user: data.session?.user || null,
  };
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
