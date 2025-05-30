import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getSessionWithCompany } from '@/lib/auth'
import { db } from '@/lib/database'
import { QuoteEditor } from '@/components/quotes/quote-editor'

interface EditQuotePageProps {
  params: {
    quoteId: string
  }
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const auth = await getSessionWithCompany()
  
  if (!auth) {
    redirect('/login')
  }

  const { company } = auth

  // Get quote with project info
  const quote = await db.quote.findFirst({
    where: {
      id: params.quoteId,
      project: {
        companyId: company.id
      }
    },
    include: {
      project: true
    }
  })

  if (!quote) {
    notFound()
  }

  const quoteData = {
    id: quote.id,
    base_costs: quote.lineItems,
    markup_percentage: quote.markup,
    final_price: quote.total,
    details: {
      subtotal: quote.subtotal,
      tax: quote.tax,
      notes: quote.notes
    },
    status: quote.status,
    created_at: quote.createdAt.toISOString(),
    valid_until: quote.validUntil?.toISOString(),
    project: {
      id: quote.project.id,
      client_name: quote.project.clientName,
      property_address: quote.project.propertyAddress,
      client_email: quote.project.clientEmail || undefined,
      client_phone: quote.project.clientPhone || undefined
    }
  }

  // Get cost settings for the company
  const costSettings = {
    labor_cost_per_hour: 50,
    paint_costs: {
      good: 25,
      better: 35,
      best: 50
    },
    supplies_base_cost: 100
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuoteEditor quote={quoteData} costSettings={costSettings} />
    </Suspense>
  )
}