
export interface User {
  id: string;
  email?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  profile?: {
    name?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
  };
}
