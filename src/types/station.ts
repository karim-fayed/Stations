export interface GasStation {
  id: string;
  name: string;
  region: string;
  sub_region: string;
  latitude: number;
  longitude: number;
  fuel_types?: string;
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

export interface SaudiCity {
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapTexts {
  getLocation: string;
  directions: string;
  nearestStation: string;
  reset: string;
  findNearest: string;
  locationDetecting: string;
  pleaseWait: string;
  locationDetected: string;
  nearestStationIs: string;
  showingDirections: string;
  directionsTo: string;
  meters: string;
  kilometers: string;
  locationError: string;
  enableLocation: string;
  fuelTypes: string;
  region: string;
  subRegion: string;
  distance: string;
  name: string;
  clickForDetails: string;
  selectCity: string;
}

// أنواع جديدة لإضافة ميزة استيراد/تصدير Excel
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// الحالة الأمنية للمستخدم
export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  session: any | null;
  loading: boolean;
}

// Add SaudiCity interface here so it doesn't conflict with other code
export interface SaudiCity {
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

