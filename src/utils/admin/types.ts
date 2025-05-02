
// Define types for working with Supabase admin users

export interface SupabaseUser {
  id: string;
  email?: string;
}

export interface SupabaseUserResponse {
  users?: SupabaseUser[];
}

export interface AdminUserData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}
