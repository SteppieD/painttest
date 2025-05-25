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
      profiles: {
        Row: {
          id: string
          company_name: string | null
          phone: string | null
          business_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name?: string | null
          phone?: string | null
          business_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string | null
          phone?: string | null
          business_info?: Json | null
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          client_name: string
          property_address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_name: string
          property_address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          property_address?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          project_id: string
          base_costs: Json
          markup_percentage: number
          final_price: number
          details: Json
          valid_until: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          base_costs: Json
          markup_percentage: number
          final_price: number
          details: Json
          valid_until?: string
          created_at?: string
        }
        Update: {
          base_costs?: Json
          markup_percentage?: number
          final_price?: number
          details?: Json
          valid_until?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          project_id: string
          role: 'user' | 'assistant'
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          role: 'user' | 'assistant'
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          content?: string
          metadata?: Json | null
        }
      }
      cost_settings: {
        Row: {
          id: string
          user_id: string
          labor_cost_per_hour: number
          paint_costs: Json
          supplies_base_cost: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          labor_cost_per_hour?: number
          paint_costs?: Json
          supplies_base_cost?: number
          updated_at?: string
        }
        Update: {
          labor_cost_per_hour?: number
          paint_costs?: Json
          supplies_base_cost?: number
          updated_at?: string
        }
      }
    }
  }
}

// Additional types for the app
export interface PaintCosts {
  good: number
  better: number
  best: number
}

export interface BaseCosts {
  labor: number
  paint: number
  supplies: number
}

export interface ProjectDetails {
  rooms: RoomDetails[]
  totalSqft: number
  paintQuality: 'good' | 'better' | 'best'
  coats: number
  specialRequirements?: string[]
}

export interface RoomDetails {
  name: string
  sqft: number
  windowsCount: number
  doorsCount: number
  ceilingIncluded: boolean
  trimIncluded: boolean
}
