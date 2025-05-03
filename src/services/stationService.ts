
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
    const { data, error } = await supabase
      .from("stations")
      .insert(station)
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
