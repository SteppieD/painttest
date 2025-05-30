import { Suspense } from 'react'
import { notFound } from 'next/navigation'
// Removed broken import
import { QuoteViewer } from '@/components/quotes/quote-viewer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface QuotePageProps {
  params: {
    quoteId: string
  }
}

export default async function QuotePage({ params }: QuotePageProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  // Get the quote and verify it belongs to the user
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      project:projects (
        id,
        client_name,
        property_address,
        user_id
      )
    `)
    .eq('id', params.quoteId)
    .single()

  if (error || !quote) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Quote Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This quote may have been deleted or doesn&apos;t exist.
          </p>
          <Link href="/quotes">
            <Button>View All Quotes</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  if (quote.project?.user_id !== user.id) {
    notFound()
  }

  return (
    <Suspense fallback={<div>Loading quote...</div>}>
      <QuoteViewer quote={quote} />
    </Suspense>
  )
}
