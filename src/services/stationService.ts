
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

// إضافة محطة جديدة
export const addStation = async (station: Omit<GasStation, "id">): Promise<GasStation> => {
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
  
  const { data, error } = await supabase
    .from("stations")
    .insert(station)
    .select()
    .single();

  if (error) {
    console.error("Error adding station:", error);
    throw error;
  }

  return data as GasStation;
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
  
  const { data, error } = await supabase
    .from("stations")
    .update(station)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating station with id ${id}:`, error);
    throw error;
  }

  return data as GasStation;
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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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
