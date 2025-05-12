export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          recipients: string[]
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          message: string
          recipients: string[]
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          message?: string
          recipients?: string[]
          created_at?: string
          created_by?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
