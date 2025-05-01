
export interface GasStation {
  id: string;
  name: string;
  region: string;
  sub_region: string;
  latitude: number;
  longitude: number;
  fuel_types: string;
  additional_info?: string;
  created_at?: string;
  updated_at?: string;
  distance_meters?: number;
  location?: any;
}

export interface AdminState {
  isAuthenticated: boolean;
  user: any | null;
}
