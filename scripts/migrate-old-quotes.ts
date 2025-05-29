// Script to migrate old quotes to new format
// Run this via: npx tsx scripts/migrate-old-quotes.ts

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateOldQuotes() {
  console.log('Starting quote migration...')
  
  // Get all quotes that are missing new fields
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*')
    .is('quote_number', null)
  
  if (error) {
    console.error('Error fetching quotes:', error)
    return
  }
  
  console.log(`Found ${quotes?.length || 0} quotes to migrate`)
  
  if (!quotes || quotes.length === 0) {
    console.log('No quotes need migration')
    return
  }
  
  // Update each quote with missing fields
  for (const quote of quotes) {
    const updates: any = {}
    
    // Add missing fields with defaults
    if (!quote.status) updates.status = 'draft'
    if (!quote.labor_percentage) updates.labor_percentage = 30
    if (!quote.tax_rate) updates.tax_rate = 0
    if (!quote.tax_amount) updates.tax_amount = 0
    
    // Calculate missing cost fields from base_costs if available
    if (quote.base_costs && typeof quote.base_costs === 'object') {
      const baseCosts = quote.base_costs as any
      if (!quote.materials_cost && baseCosts.paint) {
        updates.materials_cost = baseCosts.paint
      }
      if (!quote.labor_cost && baseCosts.labor) {
        updates.labor_cost = baseCosts.labor
      }
      if (!quote.supplies_cost && baseCosts.supplies) {
        updates.supplies_cost = baseCosts.supplies
      }
      
      // Calculate profit
      const totalBase = (baseCosts.labor || 0) + (baseCosts.paint || 0) + (baseCosts.supplies || 0)
      if (!quote.profit_amount && quote.final_price) {
        updates.profit_amount = quote.final_price - totalBase
      }
    }
    
    // Estimate gallons and sqft if missing
    if (!quote.gallons_needed && quote.details) {
      const details = quote.details as any
      if (details.totalSqft) {
        updates.total_sqft = details.totalSqft
        updates.gallons_needed = Math.ceil(details.totalSqft / 350) // Standard coverage
      }
    }
    
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', quote.id)
      
      if (updateError) {
        console.error(`Error updating quote ${quote.id}:`, updateError)
      } else {
        console.log(`Updated quote ${quote.id}`)
      }
    }
  }
  
  console.log('Migration complete!')
}

migrateOldQuotes().catch(console.error)