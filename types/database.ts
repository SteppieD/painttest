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
          client_email: string | null
          client_phone: string | null
          preferred_contact: 'email' | 'phone' | 'either'
          client_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_name: string
          property_address: string
          client_email?: string | null
          client_phone?: string | null
          preferred_contact?: 'email' | 'phone' | 'either'
          client_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          property_address?: string
          client_email?: string | null
          client_phone?: string | null
          preferred_contact?: 'email' | 'phone' | 'either'
          client_notes?: string | null
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
          status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          sent_at: string | null
          accepted_at: string | null
          rejected_at: string | null
          expires_at: string | null
          labor_percentage: number
          materials_cost: number | null
          labor_cost: number | null
          supplies_cost: number | null
          profit_amount: number | null
          tax_rate: number
          tax_amount: number
          client_notes: string | null
          internal_notes: string | null
          work_scope: Json | null
          gallons_needed: number | null
          total_sqft: number | null
          charge_rate: number | null
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
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          sent_at?: string | null
          accepted_at?: string | null
          rejected_at?: string | null
          expires_at?: string | null
          labor_percentage?: number
          materials_cost?: number | null
          labor_cost?: number | null
          supplies_cost?: number | null
          profit_amount?: number | null
          tax_rate?: number
          tax_amount?: number
          client_notes?: string | null
          internal_notes?: string | null
          work_scope?: Json | null
          gallons_needed?: number | null
          total_sqft?: number | null
          charge_rate?: number | null
        }
        Update: {
          base_costs?: Json
          markup_percentage?: number
          final_price?: number
          details?: Json
          valid_until?: string
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          sent_at?: string | null
          accepted_at?: string | null
          rejected_at?: string | null
          expires_at?: string | null
          labor_percentage?: number
          materials_cost?: number | null
          labor_cost?: number | null
          supplies_cost?: number | null
          profit_amount?: number | null
          tax_rate?: number
          tax_amount?: number
          client_notes?: string | null
          internal_notes?: string | null
          work_scope?: Json | null
          gallons_needed?: number | null
          total_sqft?: number | null
          charge_rate?: number | null
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
          default_labor_percentage: number
          spread_rate_per_gallon: number
          products: Json
        }
        Insert: {
          id?: string
          user_id: string
          labor_cost_per_hour?: number
          paint_costs?: Json
          supplies_base_cost?: number
          updated_at?: string
          default_labor_percentage?: number
          spread_rate_per_gallon?: number
          products?: Json
        }
        Update: {
          labor_cost_per_hour?: number
          paint_costs?: Json
          supplies_base_cost?: number
          updated_at?: string
          default_labor_percentage?: number
          spread_rate_per_gallon?: number
          products?: Json
        }
      }
      job_actuals: {
        Row: {
          id: string
          quote_id: string
          actual_materials_cost: number | null
          actual_labor_cost: number | null
          actual_profit: number | null
          completion_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          actual_materials_cost?: number | null
          actual_labor_cost?: number | null
          actual_profit?: number | null
          completion_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          actual_materials_cost?: number | null
          actual_labor_cost?: number | null
          actual_profit?: number | null
          completion_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'wall_paint' | 'ceiling_paint' | 'trim_paint' | 'primer' | 'other'
          cost_per_gallon: number
          brand: string | null
          quality_tier: 'good' | 'better' | 'best' | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'wall_paint' | 'ceiling_paint' | 'trim_paint' | 'primer' | 'other'
          cost_per_gallon: number
          brand?: string | null
          quality_tier?: 'good' | 'better' | 'best' | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: 'wall_paint' | 'ceiling_paint' | 'trim_paint' | 'primer' | 'other'
          cost_per_gallon?: number
          brand?: string | null
          quality_tier?: 'good' | 'better' | 'best' | null
          is_active?: boolean
          updated_at?: string
        }
      }
      quote_versions: {
        Row: {
          id: string
          quote_id: string
          version: number
          base_costs: Json
          markup_percentage: number
          final_price: number
          details: Json
          changes: Json | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          quote_id: string
          version: number
          base_costs: Json
          markup_percentage: number
          final_price: number
          details: Json
          changes?: Json | null
          created_at?: string
          created_by: string
        }
        Update: {
          base_costs?: Json
          markup_percentage?: number
          final_price?: number
          details?: Json
          changes?: Json | null
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

export interface WorkScope {
  rooms: RoomDetails[]
  description: string
  services: string[]
}

export interface Product {
  id: string
  name: string
  type: 'wall_paint' | 'ceiling_paint' | 'trim_paint' | 'primer' | 'other'
  cost_per_gallon: number
  brand?: string
  quality_tier?: 'good' | 'better' | 'best'
}

export interface QuoteDetails extends ProjectDetails {
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed'
  labor_percentage: number
  materials_cost: number
  labor_cost: number
  supplies_cost: number
  profit_amount: number
  tax_rate: number
  tax_amount: number
  client_notes?: string
  internal_notes?: string
  work_scope: WorkScope
  gallons_needed: number
  total_sqft: number
  charge_rate: number
}

export interface JobActual {
  id: string
  quote_id: string
  actual_materials_cost: number
  actual_labor_cost: number
  actual_profit: number
  completion_date: string
  notes?: string
}

export interface DashboardStats {
  total_quotes: number
  total_quote_value: number
  accepted_quotes: number
  accepted_quote_value: number
  completed_jobs: number
  total_actual_materials: number
  total_actual_labor: number
  total_actual_profit: number
}
