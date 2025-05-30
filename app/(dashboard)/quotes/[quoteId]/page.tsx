import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/database'
import { QuoteViewer } from '@/components/quotes/quote-viewer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface QuotePageProps {
  params: {
    quoteId: string
  }
}

export default async function QuotePage({ params }: QuotePageProps) {
  const auth = await requireAuth()
  
  if (!auth) {
    redirect('/quotes/login')
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

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quote Details</h1>
        <div className="flex gap-2">
          {quote.status === 'draft' && (
            <Button asChild>
              <Link href={`/quotes/${quote.id}/edit`}>
                Edit Quote
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/quotes">
              Back to Quotes
            </Link>
          </Button>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <QuoteViewer quote={quoteData} />
      </Suspense>
    </div>
  )
}