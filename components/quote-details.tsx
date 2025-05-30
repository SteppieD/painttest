'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedBaseCosts, SurfaceCalculation, QuoteStatus, QuoteMethod } from '@/types/database'

interface QuoteDetailsProps {
  quoteMethod: QuoteMethod
  markupPercentage: number
  baseCosts: EnhancedBaseCosts
  projectDetails: any
  status?: QuoteStatus
  validUntil?: string
}

export default function QuoteDetails({
  quoteMethod,
  markupPercentage,
  baseCosts,
  projectDetails,
  status = 'quoted',
  validUntil
}: QuoteDetailsProps) {
  const [totalCost, setTotalCost] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)
  const [profit, setProfit] = useState(0)

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0)
  }

  // Calculate costs whenever base costs or markup changes
  useEffect(() => {
    // Calculate the total base cost
    const materialsCost = baseCosts.paint || 0
    const laborCost = baseCosts.labor || 0
    const sundries = baseCosts.sundries || baseCosts.supplies || 0
    const doorTrimCost = baseCosts.doorTrimWork || 0
    const baseboardCost = baseCosts.baseboards || 0
    
    const total = materialsCost + laborCost + sundries + doorTrimCost + baseboardCost
    
    // Apply markup
    const final = total * (1 + (markupPercentage / 100))
    
    // Calculate profit
    const calculatedProfit = final - total
    
    setTotalCost(total)
    setFinalPrice(final)
    setProfit(calculatedProfit)
  }, [baseCosts, markupPercentage])

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
          <CardDescription>
            {quoteMethod === 'simple' ? 'Simple Quote (Surface-Based)' : 'Advanced Quote (Room-by-Room)'}
            {validUntil && ` • Valid until ${new Date(validUntil).toLocaleDateString()}`}
            {` • Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-md p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">Base Cost</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(totalCost)}</div>
            </div>
            <div className="border rounded-md p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">Final Price</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(finalPrice)}</div>
            </div>
            <div className="border rounded-md p-4 bg-primary/10">
              <div className="text-sm text-muted-foreground">Profit</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(profit)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ({markupPercentage}% markup)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Materials</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Paint</span>
                    <span>{formatCurrency(baseCosts.paint || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sundries</span>
                    <span>{formatCurrency(baseCosts.sundries || baseCosts.supplies || 0)}</span>
                  </div>
                  {(baseCosts.doorTrimWork && baseCosts.doorTrimWork > 0) && (
                    <div className="flex justify-between text-sm">
                      <span>Door & Trim Work</span>
                      <span>{formatCurrency(baseCosts.doorTrimWork)}</span>
                    </div>
                  )}
                  {(baseCosts.baseboards && baseCosts.baseboards > 0) && (
                    <div className="flex justify-between text-sm">
                      <span>Baseboards</span>
                      <span>{formatCurrency(baseCosts.baseboards)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Materials</span>
                    <span>
                      {formatCurrency(
                        (baseCosts.paint || 0) + 
                        (baseCosts.sundries || baseCosts.supplies || 0) + 
                        (baseCosts.doorTrimWork ?? 0) + 
                        (baseCosts.baseboards ?? 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Labor</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Labor Cost</span>
                    <span>{formatCurrency(baseCosts.labor || 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Labor</span>
                    <span>{formatCurrency(baseCosts.labor || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold">
                <span>Total Costs</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Markup ({markupPercentage}%)</span>
                <span>{formatCurrency(profit)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                <span>Final Price</span>
                <span>{formatCurrency(finalPrice)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Surface Details (for Simple Quote) */}
      {quoteMethod === 'simple' && projectDetails.surfaces && (
        <Card>
          <CardHeader>
            <CardTitle>Surface Details</CardTitle>
            <CardDescription>
              Paint quality: {projectDetails.paintQuality} ({projectDetails.coats} coats)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Surface</th>
                      <th className="text-right py-2">Square Feet</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Paint (Gal)</th>
                      <th className="text-right py-2">Paint Cost</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDetails.surfaces.map((surface: SurfaceCalculation, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 capitalize">{surface.type.replace('_', ' ')}</td>
                        <td className="py-2 text-right">{surface.sqft}</td>
                        <td className="py-2 text-right">${surface.ratePerSqft.toFixed(2)}/sqft</td>
                        <td className="py-2 text-right">{surface.gallonsNeeded}</td>
                        <td className="py-2 text-right">{formatCurrency(surface.paintCost)}</td>
                        <td className="py-2 text-right">{formatCurrency(surface.surfaceTotal)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium">
                      <td colSpan={5} className="py-2 text-right">Total Surface Area:</td>
                      <td className="py-2 text-right">{projectDetails.totalSqft} sqft</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room Details (for Advanced Quote) */}
      {quoteMethod === 'advanced' && projectDetails.rooms && (
        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
            <CardDescription>
              Paint quality: {projectDetails.paintQuality} ({projectDetails.coats} coats)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projectDetails.rooms.map((room: any, index: number) => (
                <div key={index} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">{room.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Dimensions</div>
                      <div className="text-sm">
                        {room.wallLengths.join(' × ')} ft • {room.ceilingHeight} ft height
                      </div>
                      <div className="text-sm">
                        Total Area: {room.sqft} sqft
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Features</div>
                      <div className="text-sm">
                        Windows: {room.windowsCount} • 
                        Doors: {room.doorsCount} •
                        Ceiling: {room.ceilingIncluded ? 'Included' : 'Not included'} •
                        Trim: {room.trimIncluded ? 'Included' : 'Not included'}
                      </div>
                      {room.baseboardLength > 0 && (
                        <div className="text-sm">
                          Baseboard Length: {room.baseboardLength} ft
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between font-medium">
                <span>Total Area:</span>
                <span>{projectDetails.totalSqft} sqft</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Job Status (for completed quotes) */}
      {status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Job Performance</CardTitle>
            <CardDescription>Actual costs vs. projected costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Actual Labor</div>
                  <div className="text-xl font-medium mt-1">{formatCurrency(baseCosts.actual_labor_cost || 0)}</div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Actual Materials</div>
                  <div className="text-xl font-medium mt-1">{formatCurrency(baseCosts.actual_materials_cost || 0)}</div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Actual Profit/Loss</div>
                  <div className="text-xl font-medium mt-1">
                    {formatCurrency(baseCosts.actual_profit_loss || 0)}
                  </div>
                </div>
              </div>
              
              {baseCosts.job_notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Job Notes</h3>
                  <div className="text-sm border rounded-md p-4 bg-muted/50">
                    {baseCosts.job_notes}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
