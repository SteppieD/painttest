'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuotePreview, QuoteData } from '@/components/quote-preview'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'

function TestQuoteContent() {
  const searchParams = useSearchParams()
  const supabase = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  
  const projectId = searchParams.get('projectId')

  useEffect(() => {
    async function fetchQuoteData() {
      if (!projectId) {
        setIsLoading(false)
        return
      }

      try {
        // Get project data (client name, address)
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        // Get quote data
        const { data: quote } = await supabase
          .from('quotes')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get user data (company info)
        const { data } = await supabase.auth.getUser()
        const user = data.user
        
        if (!user) {
          throw new Error('User not authenticated')
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (project && quote) {
          // Format data for QuotePreview
          const formattedData = {
            user: {
              name: profile?.full_name || user.email,
              company: profile?.company_name || 'Professional Painters Inc.'
            },
            client: {
              name: project.client_name,
              address: project.property_address
            },
            lineItems: generateLineItems(quote.details, quote.base_costs),
            subtotal: Object.values(quote.base_costs as Record<string, number>).reduce((a: number, b: number) => a + b, 0),
            tax: 0,
            total: quote.final_price
          }
          
          setQuoteData(formattedData)
        }
      } catch (error) {
        console.error('Error fetching quote data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load quote data.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuoteData()
  }, [projectId, supabase, toast])

  // Generate line items from quote details
  function generateLineItems(details: any, baseCosts: Record<string, number>): {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[] {
    const lineItems = []
    
    // Add labor costs
    if (baseCosts.labor) {
      lineItems.push({
        description: 'Professional Painting Labor',
        quantity: 1,
        unitPrice: baseCosts.labor,
        total: baseCosts.labor
      })
    }
    
    // Add paint costs
    if (baseCosts.paint) {
      lineItems.push({
        description: 'Premium Quality Paint',
        quantity: 1,
        unitPrice: baseCosts.paint,
        total: baseCosts.paint
      })
    }
    
    // Add supplies costs
    if (baseCosts.supplies) {
      lineItems.push({
        description: 'Supplies & Materials',
        quantity: 1,
        unitPrice: baseCosts.supplies,
        total: baseCosts.supplies
      })
    }
    
    return lineItems
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Painting Quote</h1>
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading quote data...</p>
            </div>
          ) : !quoteData ? (
            <div className="p-8 text-center">
              <p>No quote data found. Please generate a quote first.</p>
            </div>
          ) : (
            <QuotePreview quoteData={quoteData as QuoteData} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function TestQuotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Painting Quote</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p>Loading quote data...</p>
          </div>
        </div>
      </div>
    }>
      <TestQuoteContent />
    </Suspense>
  )
}
