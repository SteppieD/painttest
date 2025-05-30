'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { EnhancedBaseCosts } from '@/types/database'
import { Loader2, DollarSign } from 'lucide-react'

interface QuoteJobCompletionProps {
  quoteId: string
  finalPrice: number
  baseCosts: EnhancedBaseCosts
  actualLaborCost?: number | null
  actualMaterialsCost?: number | null
  actualSuppliesCost?: number | null
  actualProfitLoss?: number | null
  jobNotes?: string | null
  onUpdate: () => void
}

export default function QuoteJobCompletion({
  quoteId,
  finalPrice,
  baseCosts,
  actualLaborCost,
  actualMaterialsCost,
  actualSuppliesCost,
  actualProfitLoss,
  jobNotes,
  onUpdate
}: QuoteJobCompletionProps) {
  const supabase = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [laborCost, setLaborCost] = useState(actualLaborCost || baseCosts.labor || 0)
  const [materialsCost, setMaterialsCost] = useState(actualMaterialsCost || baseCosts.paint || 0)
  const [suppliesCost, setSuppliesCost] = useState(actualSuppliesCost || (baseCosts.supplies || 0) + (baseCosts.sundries || 0))
  const [notes, setNotes] = useState(jobNotes || '')
  
  // Calculate estimated values
  const estimatedLabor = baseCosts.labor || 0
  const estimatedMaterials = baseCosts.paint || 0
  const estimatedSupplies = (baseCosts.supplies || 0) + (baseCosts.sundries || 0)
  
  // Calculate profit/loss
  const totalActualCosts = Number(laborCost) + Number(materialsCost) + Number(suppliesCost)
  const profitLoss = finalPrice - totalActualCosts
  const profitMargin = (profitLoss / finalPrice) * 100
  
  // Calculate variances
  const laborVariance = estimatedLabor - Number(laborCost)
  const materialsVariance = estimatedMaterials - Number(materialsCost)
  const suppliesVariance = estimatedSupplies - Number(suppliesCost)
  const totalVariance = (estimatedLabor + estimatedMaterials + estimatedSupplies) - totalActualCosts
  
  const handleComplete = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('quotes')
        .update({
          job_status: 'completed',
          completed_at: new Date().toISOString(),
          actual_labor_cost: laborCost,
          actual_materials_cost: materialsCost,
          actual_supplies_cost: suppliesCost,
          actual_profit_loss: profitLoss,
          job_notes: notes
        })
        .eq('id', quoteId)
        
      if (error) throw error
      
      toast({
        title: 'Job Completed',
        description: 'The job has been marked as completed and actuals recorded.',
        variant: 'default'
      })
      
      onUpdate()
    } catch (error) {
      console.error('Error completing job:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark job as completed. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleUpdate = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('quotes')
        .update({
          actual_labor_cost: laborCost,
          actual_materials_cost: materialsCost,
          actual_supplies_cost: suppliesCost,
          actual_profit_loss: profitLoss,
          job_notes: notes
        })
        .eq('id', quoteId)
        
      if (error) throw error
      
      toast({
        title: 'Actuals Updated',
        description: 'The actual costs have been updated successfully.',
        variant: 'default'
      })
      
      onUpdate()
    } catch (error) {
      console.error('Error updating actuals:', error)
      toast({
        title: 'Error',
        description: 'Failed to update actual costs. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Completion Details</CardTitle>
        <CardDescription>
          Record actual costs and complete this job to track profitability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Actual Labor Cost */}
          <div className="space-y-2">
            <Label htmlFor="laborCost">Actual Labor Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="laborCost"
                type="number"
                className="pl-8"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Estimated: {formatCurrency(estimatedLabor)}</span>
              <span className={`font-medium ${laborVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {laborVariance >= 0 ? '+' : ''}{formatCurrency(laborVariance)}
              </span>
            </div>
          </div>
          
          {/* Actual Materials Cost */}
          <div className="space-y-2">
            <Label htmlFor="materialsCost">Actual Materials Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="materialsCost"
                type="number"
                className="pl-8"
                value={materialsCost}
                onChange={(e) => setMaterialsCost(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Estimated: {formatCurrency(estimatedMaterials)}</span>
              <span className={`font-medium ${materialsVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {materialsVariance >= 0 ? '+' : ''}{formatCurrency(materialsVariance)}
              </span>
            </div>
          </div>
          
          {/* Actual Supplies Cost */}
          <div className="space-y-2">
            <Label htmlFor="suppliesCost">Actual Supplies Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="suppliesCost"
                type="number"
                className="pl-8"
                value={suppliesCost}
                onChange={(e) => setSuppliesCost(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Estimated: {formatCurrency(estimatedSupplies)}</span>
              <span className={`font-medium ${suppliesVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {suppliesVariance >= 0 ? '+' : ''}{formatCurrency(suppliesVariance)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Job Notes */}
        <div className="space-y-2">
          <Label htmlFor="jobNotes">Job Notes</Label>
          <Textarea
            id="jobNotes"
            placeholder="Enter notes about the job completion, any issues encountered, or lessons learned."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
        
        {/* Profit/Loss Summary */}
        <div className="bg-muted p-4 rounded-md space-y-3">
          <h3 className="font-semibold">Job Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Quote Price:</span>
                <span className="font-medium">{formatCurrency(finalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Actual Costs:</span>
                <span className="font-medium">{formatCurrency(totalActualCosts)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span>Profit/Loss:</span>
                <span className={`font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitLoss)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Profit Margin:</span>
                <span className={`font-semibold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Overall Variance:</span>
                <span className={`font-semibold ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-4">
        <Button 
          onClick={handleUpdate}
          variant="outline"
          disabled={isLoading}
        >
          Update Actuals
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : 'Mark as Completed'}
        </Button>
      </CardFooter>
    </Card>
  )
}
