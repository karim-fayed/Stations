
import { supabase } from "@/integrations/supabase/client";
import { GasStation } from "@/types/station";

// جلب أقرب محطات
export const fetchNearestStations = async (
  latitude: number,
  longitude: number,
  limit: number = 5
): Promise<GasStation[]> => {
  try {
    const { data, error } = await supabase
      .rpc("find_nearest_stations", { 
        lat: latitude, 
        lng: longitude,
        limit_count: limit 
      });

    if (error) {
      console.error("Error finding nearest stations:", error);
      throw error;
    }

    return data as GasStation[];
  } catch (err) {
    console.error("Error in fetchNearestStations:", err);
    throw new Error(err instanceof Error ? err.message : "Unknown error finding nearest stations");
  }
};

// دالة حساب المسافة - Haversine formula
export function calculateDistance(
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

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
