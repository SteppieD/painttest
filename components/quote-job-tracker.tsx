'use client'

import { useState, useEffect } from 'react'
import QuoteJobCompletion from '@/components/quote-workflow/QuoteJobCompletion'
import { EnhancedBaseCosts } from '@/types/database'

interface QuoteJobTrackerProps {
  quoteId: string
  baseCosts: EnhancedBaseCosts
  finalPrice?: number
  onUpdate: () => void
}

export default function QuoteJobTracker({
  quoteId,
  baseCosts,
  finalPrice = 0,
  onUpdate
}: QuoteJobTrackerProps) {
  const [jobData, setJobData] = useState<{
    actualLaborCost: number | null;
    actualMaterialsCost: number | null;
    actualSuppliesCost: number | null;
    actualProfitLoss: number | null;
    jobNotes: string | null;
  }>({
    actualLaborCost: null,
    actualMaterialsCost: null,
    actualSuppliesCost: null,
    actualProfitLoss: null,
    jobNotes: null
  })
  
  // Fetch job data
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('quotes')
          .select(`
            job_status,
            actual_labor_cost,
            actual_materials_cost,
            actual_supplies_cost,
            actual_profit_loss,
            job_notes
          `)
          .eq('id', quoteId)
          .single()
        
        if (data) {
          setJobData({
            actualLaborCost: data.actual_labor_cost,
            actualMaterialsCost: data.actual_materials_cost,
            actualSuppliesCost: data.actual_supplies_cost,
            actualProfitLoss: data.actual_profit_loss,
            jobNotes: data.job_notes
          })
        }
      } catch (error) {
        console.error('Error fetching job data:', error)
      }
    }
    
    fetchJobData()
  }, [quoteId])
  
  // Forward to the new component
  return (
    <QuoteJobCompletion
      quoteId={quoteId}
      baseCosts={baseCosts}
      finalPrice={finalPrice}
      actualLaborCost={jobData.actualLaborCost}
      actualMaterialsCost={jobData.actualMaterialsCost}
      actualSuppliesCost={jobData.actualSuppliesCost}
      actualProfitLoss={jobData.actualProfitLoss}
      jobNotes={jobData.jobNotes}
      onUpdate={onUpdate}
    />
  )
}
