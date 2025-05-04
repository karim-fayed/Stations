
import { supabase } from "@/integrations/supabase/client";
import { GasStation } from "@/types/station";

/**
 * Fetch all stations from the database
 */
export const fetchStations = async (): Promise<GasStation[]> => {
  try {
    const { data, error } = await supabase
      .from("stations")
      .select("*");

    if (error) {
      console.error("Error fetching stations:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchStations:", error);
    throw error;
  }
};

/**
 * Fetch stations by region
 */
export const fetchStationsByRegion = async (region: string): Promise<GasStation[]> => {
  try {
    const { data, error } = await supabase
      .from("stations")
      .select("*")
      .eq("region", region);

    if (error) {
      console.error("Error fetching stations by region:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchStationsByRegion:", error);
    throw error;
  }
};

/**
 * Fetch a single station by ID
 */
export const fetchStationById = async (id: string): Promise<GasStation | null> => {
  try {
    const { data, error } = await supabase
      .from("stations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching station by id:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchStationById:", error);
    throw error;
  }
};

/**
 * Create a new station
 */
export const createStation = async (station: Partial<GasStation>): Promise<GasStation> => {
  try {
    // Ensure required fields are present
    if (!station.name || !station.latitude || !station.longitude) {
      throw new Error("Station name, latitude and longitude are required");
    }

    const { data, error } = await supabase
      .from("stations")
      .insert([{
        name: station.name,
        region: station.region || '',
        sub_region: station.sub_region || '',
        latitude: station.latitude,
        longitude: station.longitude,
        fuel_types: station.fuel_types || '',
        additional_info: station.additional_info || ''
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating station:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createStation:", error);
    throw error;
  }
};

/**
 * Add station - alias for createStation for backward compatibility
 */
export const addStation = async (station: Partial<GasStation>, skipDuplicateCheck?: boolean): Promise<GasStation> => {
  try {
    // If skipDuplicateCheck is true, bypass duplicate check
    if (skipDuplicateCheck) {
      return await createStation(station);
    }

    // Check for duplicates before adding
    if (station.name && station.latitude && station.longitude) {
      const duplicateCheck = await checkDuplicateStation(station.name, station.latitude, station.longitude);
      if (duplicateCheck.isDuplicate) {
        throw new Error(`Duplicate station found: ${duplicateCheck.duplicateType}`);
      }
    }

    return await createStation(station);
  } catch (error) {
    console.error("Error in addStation:", error);
    throw error;
  }
};

/**
 * Update a station
 */
export const updateStation = async (id: string, updates: Partial<GasStation>): Promise<GasStation> => {
  try {
    const { data, error } = await supabase
      .from("stations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating station:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateStation:", error);
    throw error;
  }
};

/**
 * Delete a station
 */
export const deleteStation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("stations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting station:", error);
      throw error;
    }

  } catch (error) {
    console.error("Error in deleteStation:", error);
    throw error;
  }
};

/**
 * Fetch nearest stations based on latitude and longitude
 */
export const fetchNearestStations = async (
  latitude: number,
  longitude: number,
  limit = 5,
  maxDistance = 50000 // 50 km in meters
): Promise<GasStation[]> => {
  try {
    console.log(`Finding stations near: ${latitude}, ${longitude}, limit: ${limit}`);
    
    // First try with PostGIS
    try {
      // Fixed: Use a simpler query approach to avoid parameter interpolation issues
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order(`location <-> point(${longitude}, ${latitude})::geography`, { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Manually calculate distances since we couldn't get them directly from the query
        const stationsWithDistance = data.map(station => {
          const distance = calculateDistance(
            latitude,
            longitude,
            station.latitude,
            station.longitude
          );
          
          return {
            ...station,
            distance_meters: distance * 1000 // Convert km to meters
          };
        });
        
        return stationsWithDistance;
      }
    } catch (postGisError) {
      console.warn("PostGIS query failed, falling back to manual distance calculation", postGisError);
    }

    // Fallback method: Get all stations and calculate distances manually
    const { data: allStations, error: fetchError } = await supabase
      .from('stations')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    if (!allStations || allStations.length === 0) {
      return [];
    }

    // Calculate distances and sort
    const stationsWithDistance = allStations.map(station => {
      const distance = calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude
      );
      
      return {
        ...station,
        distance_meters: distance * 1000 // Convert km to meters
      };
    });

    // Sort by distance and limit results
    stationsWithDistance.sort((a, b) => a.distance_meters - b.distance_meters);
    return stationsWithDistance.slice(0, limit);
    
  } catch (error) {
    console.error("Error in fetchNearestStations:", error);
    throw error;
  }
};

/**
 * Check for duplicate stations
 */
export const checkDuplicateStation = async (
  name: string,
  latitude: number,
  longitude: number
): Promise<{ isDuplicate: boolean; duplicateStation?: GasStation; duplicateType?: 'name' | 'location' }> => {
  try {
    // Check for exact name match
    const { data: nameMatch, error: nameError } = await supabase
      .from("stations")
      .select("*")
      .eq("name", name)
      .maybeSingle();

    if (nameError) {
      console.error("Error checking duplicate name:", nameError);
      throw nameError;
    }

    if (nameMatch) {
      return {
        isDuplicate: true,
        duplicateStation: nameMatch as GasStation,
        duplicateType: 'name'
      };
    }

    // Fixed: Use a simpler approach for location check to avoid PostGIS errors
    // Get nearby stations within 100 meters using manual calculation
    const { data: allStations, error: locationError } = await supabase
      .from('stations')
      .select('*');

    if (locationError) {
      console.error("Error checking nearby stations:", locationError);
      throw locationError;
    }

    if (allStations && allStations.length > 0) {
      // Find stations within 100 meters
      const nearbyStation = allStations.find(station => {
        const distance = calculateDistance(
          latitude,
          longitude,
          station.latitude,
          station.longitude
        );
        return (distance * 1000) < 100; // Convert km to meters and check if < 100m
      });

      if (nearbyStation) {
        return {
          isDuplicate: true,
          duplicateStation: nearbyStation as GasStation,
          duplicateType: 'location'
        };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("Error in checkDuplicateStation:", error);
    throw error;
  }
};

/**
 * Check for duplicate stations in a list
 */
export const checkDuplicateStationsInList = async (
  stations: GasStation[]
): Promise<Map<string, boolean>> => {
  const duplicateMap = new Map<string, boolean>();
  
  try {
    // First set all stations to false (not duplicate)
    stations.forEach(station => {
      duplicateMap.set(station.id, false);
    });

    // Process stations to find duplicates
    for (let i = 0; i < stations.length; i++) {
      const station1 = stations[i];
      
      for (let j = i + 1; j < stations.length; j++) {
        const station2 = stations[j];
        
        // Check for name duplicates
        if (station1.name.toLowerCase() === station2.name.toLowerCase()) {
          duplicateMap.set(station1.id, true);
          duplicateMap.set(station2.id, true);
          continue;
        }
        
        // Check for location duplicates (within 100 meters)
        const distance = calculateDistance(
          station1.latitude, 
          station1.longitude, 
          station2.latitude, 
          station2.longitude
        );
        
        if (distance < 0.1) { // 100 meters is 0.1 km
          duplicateMap.set(station1.id, true);
          duplicateMap.set(station2.id, true);
        }
      }
    }
    
    return duplicateMap;
  } catch (error) {
    console.error("Error checking duplicate stations in list:", error);
    throw error;
  }
};

/**
 * Delete duplicate stations
 */
export const deleteDuplicateStations = async (
  stations: GasStation[]
): Promise<{ deleted: number; remainingStations: GasStation[] }> => {
  try {
    // First identify all duplicates
    const duplicateMap = await checkDuplicateStationsInList(stations);
    
    const duplicateIds: string[] = [];
    duplicateMap.forEach((isDuplicate, id) => {
      if (isDuplicate) {
        // Keep the first occurrence of each group of duplicates
        // Delete the rest
        const stationIndex = stations.findIndex(s => s.id === id);
        if (stationIndex > 0) {
          duplicateIds.push(id);
        }
      }
    });
    
    if (duplicateIds.length === 0) {
      return { deleted: 0, remainingStations: stations };
    }
    
    // Delete the duplicates
    const { error } = await supabase
      .from("stations")
      .delete()
      .in("id", duplicateIds);
      
    if (error) {
      console.error("Error deleting duplicate stations:", error);
      throw error;
    }
    
    // Return the count of deleted stations and the remaining stations
    const remainingStations = stations.filter(station => 
      !duplicateIds.includes(station.id)
    );
    
    return {
      deleted: duplicateIds.length,
      remainingStations
    };
  } catch (error) {
    console.error("Error deleting duplicate stations:", error);
    throw error;
  }
};

/**
 * Helper function to calculate distance between two points in km
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Authentication related functions
 */

/**
 * Check admin status
 */
export const checkAdminStatus = async (): Promise<{ isAuthenticated: boolean; user: any }> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking admin status:", error);
      return { isAuthenticated: false, user: null };
    }
    
    if (!data.session) {
      return { isAuthenticated: false, user: null };
    }
    
    return { 
      isAuthenticated: true, 
      user: data.session.user 
    };
  } catch (error) {
    console.error("Error in checkAdminStatus:", error);
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Admin logout
 */
export const adminLogout = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in adminLogout:", error);
    throw error;
  }
};
