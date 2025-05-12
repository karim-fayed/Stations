export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_deleted?: boolean;
  updated_at?: string;
  profile?: {
    name?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface NewUser {
  email: string;
  password: string;
  role: string;
  name?: string;
}

export interface UserUpdate {
  password?: string;
  role?: string;
}
