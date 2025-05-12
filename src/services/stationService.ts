import { supabase, adminSupabase, insertStationDirect } from "@/integrations/supabase/client";
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

    // Validate data types
    if (typeof station.latitude !== 'number' || isNaN(station.latitude)) {
      throw new Error("Latitude must be a valid number");
    }
    if (typeof station.longitude !== 'number' || isNaN(station.longitude)) {
      throw new Error("Longitude must be a valid number");
    }

    console.log("Creating new station:", {
      name: station.name,
      region: station.region || '',
      latitude: station.latitude,
      longitude: station.longitude
    });

    // تحضير بيانات المحطة
    const stationData = {
      name: station.name,
      region: station.region || '',
      sub_region: station.sub_region || '',
      latitude: station.latitude,
      longitude: station.longitude,
      fuel_types: station.fuel_types || '',
      additional_info: station.additional_info || ''
    };

    console.log("About to insert station with data:", JSON.stringify(stationData));

    // Try with our specialized direct insertion function to bypass RLS issues
    try {
      // Method 1: Try direct insertion using insertStationDirect
      console.log("Attempting to add station using insertStationDirect");
      const result = await insertStationDirect(stationData);
      console.log("Station created successfully with direct method:", result);
      return result;
    } catch (directError) {
      console.error("Direct insertion failed:", directError);

      // Method 2: Try with regular approach as a last resort
      console.log("Trying method 2: standard Supabase client as last resort");
      try {
        // Try using simpler data structure
        const simplifiedData = {
          name: stationData.name,
          region: stationData.region,
          latitude: stationData.latitude,
          longitude: stationData.longitude
        };

        const { data, error } = await supabase
          .from("stations")
          .insert([simplifiedData])
          .select()
          .single();

        if (error) {
          console.error("Error creating station with standard client:", error);
          throw error;
        }

        if (!data || !data.id) {
          throw new Error("Failed to create station - no data returned from database");
        }

        console.log("Station created successfully with standard client:", data);

        // If we have additional data, update the record in a separate call
        if (data.id && (stationData.sub_region || stationData.fuel_types || stationData.additional_info)) {
          const updateData: any = {};
          if (stationData.sub_region) updateData.sub_region = stationData.sub_region;
          if (stationData.fuel_types) updateData.fuel_types = stationData.fuel_types;
          if (stationData.additional_info) updateData.additional_info = stationData.additional_info;

          try {
            const { data: updatedData, error: updateError } = await supabase
              .from('stations')
              .update(updateData)
              .eq('id', data.id)
              .select()
              .single();

            if (updateError) {
              console.error("Failed to update with additional data:", updateError);
              return data; // Return original data even if update fails
            }

            return updatedData;
          } catch (updateError) {
            console.error("Error updating additional data:", updateError);
            return data; // Return original data if update fails
          }
        }

        return data;
      } catch (standardError) {
        console.error("All insertion methods failed:", standardError);
        throw standardError;
      }
    }
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
export const updateStation = async (stationId: string, stationData: any) => {
  try {
    console.log('Updating station with data:', stationData);

    // محاولة أولى: استدعاء دالة update_station
    try {
      const { data, error } = await supabase
        .rpc('update_station', {
          p_station_id: stationId,
          p_station_data: stationData
        });

      if (error) {
        console.warn('Error using update_station RPC function:', error);
        throw error;
      }

      console.log('Station updated successfully using RPC function:', data);
      return data;
    } catch (rpcError) {
      console.warn('RPC update failed, trying alternative method:', rpcError);

      // محاولة ثانية: تحديث المحطة مباشرة باستخدام UPDATE
      try {
        // تحضير بيانات التحديث
        const updateData: any = {};

        // إضافة الحقول المتوفرة فقط
        if (stationData.name) updateData.name = stationData.name;
        if (stationData.region) updateData.region = stationData.region;
        if (stationData.sub_region) updateData.sub_region = stationData.sub_region;
        if (stationData.latitude) updateData.latitude = stationData.latitude;
        if (stationData.longitude) updateData.longitude = stationData.longitude;
        if (stationData.fuel_types) updateData.fuel_types = stationData.fuel_types;
        if (stationData.additional_info) updateData.additional_info = stationData.additional_info;

        // إضافة تاريخ التحديث
        updateData.updated_at = new Date().toISOString();

        // تنفيذ التحديث
        const { data: updatedData, error: updateError } = await supabase
          .from('stations')
          .update(updateData)
          .eq('id', stationId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating station with direct method:', updateError);
          throw updateError;
        }

        console.log('Station updated successfully using direct method:', updatedData);
        return updatedData;
      } catch (directError) {
        console.error('Direct update failed:', directError);

        // محاولة ثالثة: محاولة إصلاح الدالة ثم إعادة المحاولة
        try {
          console.log('Attempting to fix update_station function and retry');

          // محاولة استدعاء دالة إصلاح update_station
          await supabase.rpc('direct_update_station_function');

          // إعادة المحاولة بعد الإصلاح
          const { data: retryData, error: retryError } = await supabase
            .rpc('update_station', {
              p_station_id: stationId,
              p_station_data: stationData
            });

          if (retryError) {
            console.error('Error updating station after fix attempt:', retryError);
            throw retryError;
          }

          console.log('Station updated successfully after fixing function:', retryData);
          return retryData;
        } catch (fixError) {
          console.error('All update methods failed:', fixError);
          throw new Error('Failed to update station after multiple attempts');
        }
      }
    }
  } catch (error) {
    console.error('Error in updateStation:', error);
    throw error;
  }
};

/**
 * Delete a station
 */
export const deleteStation = async (id: string): Promise<void> => {
  try {
    // التحقق من وجود معرف صالح
    if (!id || id.trim() === '') {
      throw new Error("Invalid station ID for deletion");
    }

    console.log(`Attempting to delete station with ID: ${id}`);

    // Make sure the ID exists before deleting
    const { data: existingStation, error: checkError } = await supabase
      .from("stations")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError) {
      console.error("Error checking if station exists:", checkError);
      throw new Error(`Cannot verify station with ID ${id} exists: ${checkError.message}`);
    }

    if (!existingStation) {
      throw new Error(`Station with ID ${id} does not exist`);
    }

    // استخدام الطريقة المباشرة لحذف المحطة
    console.log("Deleting station using direct method");
    const { error } = await supabase
      .from("stations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting station:", error);
      throw error;
    }

    console.log(`Successfully deleted station with ID: ${id}`);
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

    // Filter by maxDistance if specified
    const filteredStations = stationsWithDistance.filter(
      station => station.distance_meters <= maxDistance
    );

    return filteredStations.slice(0, limit);

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
    console.log(`Attempting to delete ${duplicateIds.length} duplicate stations with IDs:`, duplicateIds);

    // حذف المحطات المكررة واحدة تلو الأخرى لتجنب مشاكل الحذف الجماعي
    let deletedCount = 0;
    for (const id of duplicateIds) {
      try {
        // Skip invalid IDs
        if (!id || id.trim() === '') {
          console.warn("Skipping invalid station ID");
          continue;
        }

        console.log(`Deleting duplicate station with ID: ${id}`);

        // Verify the station exists before deleting
        const { data: existingStation, error: checkError } = await supabase
          .from("stations")
          .select("id")
          .eq("id", id)
          .single();

        if (checkError) {
          console.warn(`Error verifying station with ID ${id} exists:`, checkError);
          continue;
        }

        if (!existingStation) {
          console.warn(`Station with ID ${id} does not exist, skipping`);
          continue;
        }

        // Delete with a proper WHERE clause
        const { error } = await supabase
          .from("stations")
          .delete()
          .eq("id", id);

        if (error) {
          console.error(`Error deleting station with ID ${id}:`, error);
        } else {
          deletedCount++;
        }
      } catch (err) {
        console.error(`Exception deleting station with ID ${id}:`, err);
      }
    }

    console.log(`Successfully deleted ${deletedCount} duplicate stations`);

    // إذا لم يتم حذف أي محطة، نرجع المحطات كما هي
    if (deletedCount === 0) {
      return { deleted: 0, remainingStations: stations };
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
