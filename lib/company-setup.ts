import { createClient } from '@/lib/supabase/server';
import { 
  DefaultRates, 
  DefaultPaintCosts, 
  DoorTrimPricing, 
  BaseboardPricing 
} from '@/types/database';

interface CompanySetupData {
  userId: string;
  companyName: string;
  contactName: string;
  defaultLaborPercentage: number;
  defaultSpreadRate: number;
  doorTrimPricing: DoorTrimPricing;
  baseboardPricing: BaseboardPricing;
  defaultRates: DefaultRates;
  defaultPaintCosts: DefaultPaintCosts;
}

/**
 * Creates or updates company settings during the onboarding process
 */
export async function setupCompanySettings(data: CompanySetupData) {
  const supabase = await createClient();
  
  // Check if settings already exist
  const { data: existingSettings } = await supabase
    .from('cost_settings')
    .select('id')
    .eq('user_id', data.userId)
    .single();
  
  if (existingSettings) {
    // Update existing settings
    const { data: updatedSettings, error } = await supabase
      .from('cost_settings')
      .update({
        company_name: data.companyName,
        contact_name: data.contactName,
        default_labor_percentage: data.defaultLaborPercentage,
        default_spread_rate: data.defaultSpreadRate,
        door_trim_pricing: data.doorTrimPricing,
        baseboard_pricing: data.baseboardPricing,
        default_rates: data.defaultRates,
        default_paint_costs: data.defaultPaintCosts,
      })
      .eq('user_id', data.userId)
      .select();
    
    if (error) throw error;
    return updatedSettings;
  } else {
    // Create new settings
    const { data: newSettings, error } = await supabase
      .from('cost_settings')
      .insert({
        user_id: data.userId,
        company_name: data.companyName,
        contact_name: data.contactName,
        default_labor_percentage: data.defaultLaborPercentage,
        default_spread_rate: data.defaultSpreadRate,
        door_trim_pricing: data.doorTrimPricing,
        baseboard_pricing: data.baseboardPricing,
        default_rates: data.defaultRates,
        default_paint_costs: data.defaultPaintCosts,
        // Keep default values for other fields
        labor_cost_per_hour: 25,
        paint_costs: { good: 25, better: 35, best: 50 },
        supplies_base_cost: 100
      })
      .select();
    
    if (error) throw error;
    return newSettings;
  }
}

/**
 * Add a paint product to the user's inventory
 */
export interface PaintProductData {
  userId: string;
  productName: string;
  useCase: 'walls' | 'ceilings' | 'trim' | 'doors';
  costPerGallon: number;
  sheen?: string;
}

export async function addPaintProduct(data: PaintProductData) {
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from('paint_products')
    .insert({
      user_id: data.userId,
      product_name: data.productName,
      use_case: data.useCase,
      cost_per_gallon: data.costPerGallon,
      sheen: data.sheen,
      is_active: true
    })
    .select();
  
  if (error) throw error;
  return product;
}

/**
 * Get user's company settings
 */
export async function getCompanySettings(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cost_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
  
  return data;
}

/**
 * Get user's paint products
 */
export async function getPaintProducts(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('paint_products')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('product_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching paint products:', error);
    return [];
  }
  
  return data;
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedSetup(userId: string): Promise<boolean> {
  const settings = await getCompanySettings(userId);
  return settings?.company_name ? true : false;
}
