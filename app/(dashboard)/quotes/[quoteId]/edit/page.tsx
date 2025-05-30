import { Suspense } from 'react'
import { notFound } from 'next/navigation'
// Removed broken import
import { QuoteEditor } from '@/components/quotes/quote-editor'

interface EditQuotePageProps {
  params: {
    quoteId: string
  }
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
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
        client_email,
        client_phone,
        user_id
      )
    `)
    .eq('id', params.quoteId)
    .single()

  if (error || !quote) {
    notFound()
  }
  
  if (quote.project?.user_id !== user.id) {
    notFound()
  }

  // Get user's cost settings
  const { data: costSettings } = await supabase
    .from('cost_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <QuoteEditor quote={quote} costSettings={costSettings} />
    </Suspense>
  )
}