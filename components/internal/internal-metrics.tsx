/**
 * Internal metrics component - FOR INTERNAL USE ONLY
 * This should never be shown to clients
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { addInternalMetricsToBaseCosts } from '@/lib/internal-calculations'
import type { BaseCosts } from '@/types/database'

interface InternalMetricsProps {
  baseCosts: BaseCosts & { sundries?: number; supplies?: number }
  markupPercentage: number
  className?: string
}

export function InternalMetrics({ baseCosts, markupPercentage, className }: InternalMetricsProps) {
  const metrics = addInternalMetricsToBaseCosts(baseCosts, markupPercentage)
  
  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
          🚨 Internal Metrics Only
          <span className="text-xs bg-red-200 px-2 py-1 rounded">DO NOT SHOW TO CLIENT</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Client-facing calculations */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Client-Facing</h4>
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(metrics.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Material Costs:</span>
            <span>{formatCurrency(metrics.materialCosts)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium border-t pt-1">
            <span>Final Price:</span>
            <span>{formatCurrency(metrics.finalPrice)}</span>
          </div>
        </div>

        {/* Internal-only calculations */}
        <div className="space-y-1 border-t pt-3">
          <h4 className="text-xs font-medium text-red-600 uppercase tracking-wide">Internal Analysis</h4>
          <div className="flex justify-between text-sm">
            <span>Net Revenue:</span>
            <span className="font-mono">{formatCurrency(metrics.netRevenue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Projected Labour (30%):</span>
            <span className="font-mono">{formatCurrency(metrics.projectedLabour)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Projected Profit:</span>
            <span className={`font-mono ${metrics.projectedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.projectedProfit)}
            </span>
          </div>
          
          {/* Profit margin indicator */}
          <div className="flex justify-between text-xs text-gray-500 pt-1">
            <span>Profit Margin:</span>
            <span>
              {((metrics.projectedProfit / metrics.subtotal) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* Warnings */}
        {metrics.projectedProfit <= 0 && (
          <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-red-700">
            ⚠️ Warning: Projected profit is {metrics.projectedProfit <= 0 ? 'zero or negative' : 'low'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Lightweight version for inline display
 */
export function InternalMetricsInline({ baseCosts, markupPercentage }: InternalMetricsProps) {
  const metrics = addInternalMetricsToBaseCosts(baseCosts, markupPercentage)
  
  return (
    <div className="text-xs text-gray-500 space-y-1 border-l-2 border-red-200 pl-3">
      <div className="text-red-600 font-medium">Internal: </div>
      <div>Net Revenue: {formatCurrency(metrics.netRevenue)}</div>
      <div>Projected Labour: {formatCurrency(metrics.projectedLabour)}</div>
      <div className={metrics.projectedProfit > 0 ? 'text-green-600' : 'text-red-600'}>
        Projected Profit: {formatCurrency(metrics.projectedProfit)}
      </div>
    </div>
  )
}