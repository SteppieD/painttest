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
          logo_url: string | null
          logo_storage_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name?: string | null
          phone?: string | null
          business_info?: Json | null
          logo_url?: string | null
          logo_storage_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string | null
          phone?: string | null
          business_info?: Json | null
          logo_url?: string | null
          logo_storage_path?: string | null
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
          quote_method: string | null
          job_status: string | null
          actual_labor_cost: number | null
          actual_materials_cost: number | null
          actual_supplies_cost: number | null
          actual_profit_loss: number | null
          job_notes: string | null
          completed_at: string | null
          sundries_cost: number | null
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
          quote_method?: string
          job_status?: string
          actual_labor_cost?: number | null
          actual_materials_cost?: number | null
          actual_supplies_cost?: number | null
          actual_profit_loss?: number | null
          job_notes?: string | null
          completed_at?: string | null
          sundries_cost?: number | null
        }
        Update: {
          base_costs?: Json
          markup_percentage?: number
          final_price?: number
          details?: Json
          valid_until?: string
          quote_method?: string
          job_status?: string
          actual_labor_cost?: number | null
          actual_materials_cost?: number | null
          actual_supplies_cost?: number | null
          actual_profit_loss?: number | null
          job_notes?: string | null
          completed_at?: string | null
          sundries_cost?: number | null
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
          company_name: string | null
          contact_name: string | null
          default_labor_percentage: number | null
          default_spread_rate: number | null
          door_trim_pricing: Json | null
          baseboard_pricing: Json | null
          default_rates: Json | null
          default_paint_costs: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          labor_cost_per_hour?: number
          paint_costs?: Json
          supplies_base_cost?: number
          updated_at?: string
          company_name?: string | null
          contact_name?: string | null
          default_labor_percentage?: number | null
          default_spread_rate?: number | null
          door_trim_pricing?: Json | null
          baseboard_pricing?: Json | null
          default_rates?: Json | null
          default_paint_costs?: Json | null
        }
        Update: {
          labor_cost_per_hour?: number
          paint_costs?: Json
          supplies_base_cost?: number
          updated_at?: string
          company_name?: string | null
          contact_name?: string | null
          default_labor_percentage?: number | null
          default_spread_rate?: number | null
          door_trim_pricing?: Json | null
          baseboard_pricing?: Json | null
          default_rates?: Json | null
          default_paint_costs?: Json | null
        }
      }
      paint_products: {
        Row: {
          id: string
          user_id: string
          product_name: string
          use_case: string
          cost_per_gallon: number
          sheen: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_name: string
          use_case: string
          cost_per_gallon: number
          sheen?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          product_name?: string
          use_case?: string
          cost_per_gallon?: number
          sheen?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      quote_surfaces: {
        Row: {
          id: string
          quote_id: string
          surface_type: string
          square_footage: number
          rate_per_sqft: number
          paint_product_id: string | null
          custom_paint_name: string | null
          paint_cost_per_gallon: number
          spread_rate: number
          gallons_needed: number
          paint_cost: number
          surface_total: number
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          surface_type: string
          square_footage: number
          rate_per_sqft: number
          paint_product_id?: string | null
          custom_paint_name?: string | null
          paint_cost_per_gallon: number
          spread_rate?: number
          gallons_needed: number
          paint_cost: number
          surface_total: number
          created_at?: string
        }
        Update: {
          surface_type?: string
          square_footage?: number
          rate_per_sqft?: number
          paint_product_id?: string | null
          custom_paint_name?: string | null
          paint_cost_per_gallon?: number
          spread_rate?: number
          gallons_needed?: number
          paint_cost?: number
          surface_total?: number
        }
      }
      room_details: {
        Row: {
          id: string
          project_id: string
          room_name: string
          wall_lengths: Json
          ceiling_height: number
          door_count: number
          door_types: Json
          window_count: number
          baseboard_length: number
          ceiling_included: boolean
          trim_included: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          room_name: string
          wall_lengths: Json
          ceiling_height?: number
          door_count?: number
          door_types?: Json
          window_count?: number
          baseboard_length?: number
          ceiling_included?: boolean
          trim_included?: boolean
          created_at?: string
        }
        Update: {
          room_name?: string
          wall_lengths?: Json
          ceiling_height?: number
          door_count?: number
          door_types?: Json
          window_count?: number
          baseboard_length?: number
          ceiling_included?: boolean
          trim_included?: boolean
        }
      }
    }
  }
}

// Additional types for the app
export type QuoteStatus = 'quoted' | 'accepted' | 'denied' | 'completed' | 'expired'

export type SurfaceType = 'walls' | 'ceilings' | 'trim' | 'doors' | 'baseboards'

export type QuoteMethod = 'simple' | 'advanced'

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

export interface EnhancedBaseCosts extends BaseCosts {
  doorTrimWork?: number
  baseboards?: number
  sundries?: number
  
  // Actual job cost tracking
  actual_labor_cost?: number
  actual_materials_cost?: number
  actual_supplies_cost?: number
  actual_profit_loss?: number
  job_notes?: string
}

export interface DefaultRates {
  walls: number
  ceilings: number
  trim_doors: number
}

export interface DefaultPaintCosts {
  walls: number
  ceilings: number
  trim_doors: number
}

export interface DoorTrimPricing {
  door_unit_price: number
  trim_linear_foot_price: number
}

export interface BaseboardPricing {
  charge_method: 'linear_foot' | 'included'
  price_per_linear_foot: number
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

export interface EnhancedRoomDetails extends RoomDetails {
  wallLengths: number[]
  ceilingHeight: number
  baseboardLength: number
  doorTypes: DoorType[]
}

export interface DoorType {
  type: string
  count: number
  unitPrice: number
}

export interface SurfaceCalculation {
  type: SurfaceType
  sqft: number
  ratePerSqft: number
  paintProductId?: string
  customPaintName?: string
  paintCostPerGallon: number
  spreadRate: number
  gallonsNeeded: number
  paintCost: number
  surfaceTotal: number
}

export interface SimpleQuoteInput {
  surfaces: {
    type: SurfaceType
    sqft: number
    ratePerSqft: number
    paintProductId?: string
    customPaintName?: string
    paintCostPerGallon: number
    spreadRate: number
  }[]
  sundries: number
  laborPercentage: number
}

export interface SimpleQuoteResult {
  surfaceCalculations: SurfaceCalculation[]
  totalProjectPrice: number
  totalMaterialsCost: number
  laborEstimate: number
  sundries: number
  projectedProfit: number
}
