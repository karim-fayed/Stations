
import { supabase } from "@/integrations/supabase/client";
import { GasStation } from "@/types/station";

export const fetchStations = async (): Promise<GasStation[]> => {
  const { data, error } = await supabase
    .from('stations')
    .select('*');

  if (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }

  return data || [];
};

export const fetchNearestStations = async (lat: number, lng: number, limit: number = 5): Promise<GasStation[]> => {
  const { data, error } = await supabase
    .rpc('find_nearest_stations', { lat, lng, limit_count: limit });

  if (error) {
    console.error('Error fetching nearest stations:', error);
    throw error;
  }

  return data || [];
};

export const addStation = async (station: Omit<GasStation, 'id'>): Promise<GasStation> => {
  const { data, error } = await supabase
    .from('stations')
    .insert([station])
    .select();

  if (error) {
    console.error('Error adding station:', error);
    throw error;
  }

  return data[0];
};

export const updateStation = async (id: string, updates: Partial<GasStation>): Promise<GasStation> => {
  const { data, error } = await supabase
    .from('stations')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating station:', error);
    throw error;
  }

  return data[0];
};

export const deleteStation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('stations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting station:', error);
    throw error;
  }
};

export const adminLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error during login:', error);
    throw error;
  }

  return data;
};

export const adminLogout = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error during logout:', error);
    throw error;
  }

  return true;
};

export const checkAdminStatus = async () => {
  const { data } = await supabase.auth.getUser();
  
  if (data?.user) {
    // التحقق إذا كان المستخدم موجودًا في جدول المشرفين
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
      
    if (error || !adminData) {
      return { isAuthenticated: false, user: null };
    }
    
    return { isAuthenticated: true, user: data.user };
  }
  
  return { isAuthenticated: false, user: null };
};
