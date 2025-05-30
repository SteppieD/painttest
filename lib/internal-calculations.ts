/**
 * Internal calculation utilities for profit analysis
 * These calculations are for internal use only and should not appear in client-facing quotes
 */

export interface InternalCalculationResult {
  // Client-facing values
  subtotal: number
  materialCosts: number
  finalPrice: number
  
  // Internal-only values
  netRevenue: number
  projectedLabour: number
  projectedProfit: number
}

interface QuoteBreakdown {
  labor: number
  paint: number
  sundries: number
  additionalCosts?: number // doors, baseboards, etc.
}

/**
 * Calculate internal profit metrics for quote analysis
 * @param quoteBreakdown - The base costs breakdown
 * @param markupPercentage - Markup percentage applied to create final price
 * @returns Internal calculation results
 */
export function calculateInternalMetrics(
  quoteBreakdown: QuoteBreakdown,
  markupPercentage: number
): InternalCalculationResult {
  // Calculate subtotal (base cost before markup)
  const subtotal = quoteBreakdown.labor + 
                  quoteBreakdown.paint + 
                  quoteBreakdown.sundries + 
                  (quoteBreakdown.additionalCosts || 0)
  
  // Material costs = paint + sundries (excludes labor)
  const materialCosts = quoteBreakdown.paint + quoteBreakdown.sundries
  
  // Final price = subtotal + markup
  const markupAmount = subtotal * (markupPercentage / 100)
  const finalPrice = subtotal + markupAmount
  
  // INTERNAL CALCULATIONS (not for client view):
  
  // 1. Net Revenue = Subtotal - Material Costs
  const netRevenue = subtotal - materialCosts
  
  // 2. Projected Labour = 30% of Subtotal
  const projectedLabour = subtotal * 0.30
  
  // 3. Projected Profit = Net Revenue - Projected Labour
  const projectedProfit = netRevenue - projectedLabour
  
  return {
    // Client-facing
    subtotal,
    materialCosts,
    finalPrice,
    
    // Internal-only
    netRevenue,
    projectedLabour,
    projectedProfit
  }
}

/**
 * Get only client-facing values (excludes internal metrics)
 */
export function getClientFacingValues(internalResult: InternalCalculationResult) {
  return {
    subtotal: internalResult.subtotal,
    materialCosts: internalResult.materialCosts,
    finalPrice: internalResult.finalPrice
  }
}

/**
 * Get only internal values (for profit analysis)
 */
export function getInternalOnlyValues(internalResult: InternalCalculationResult) {
  return {
    netRevenue: internalResult.netRevenue,
    projectedLabour: internalResult.projectedLabour,
    projectedProfit: internalResult.projectedProfit
  }
}

/**
 * Validate that internal calculations are profitable
 */
export function validateProfitability(internalResult: InternalCalculationResult): {
  isProftable: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  
  if (internalResult.projectedProfit <= 0) {
    warnings.push('Projected profit is zero or negative')
  }
  
  if (internalResult.netRevenue <= internalResult.projectedLabour) {
    warnings.push('Net revenue does not cover projected labour costs')
  }
  
  const profitMargin = (internalResult.projectedProfit / internalResult.subtotal) * 100
  if (profitMargin < 10) {
    warnings.push(`Low profit margin: ${profitMargin.toFixed(1)}%`)
  }
  
  return {
    isProftable: warnings.length === 0,
    warnings
  }
}

/**
 * Lightweight utility to calculate internal metrics from existing baseCosts
 * This allows existing components to add internal calculations without major changes
 */
export function addInternalMetricsToBaseCosts(baseCosts: {
  labor: number
  paint: number
  sundries?: number
  supplies?: number
}, markupPercentage: number = 0) {
  const sundries = baseCosts.sundries || baseCosts.supplies || 0
  
  return calculateInternalMetrics(
    {
      labor: baseCosts.labor,
      paint: baseCosts.paint,
      sundries: sundries
    },
    markupPercentage
  )
}