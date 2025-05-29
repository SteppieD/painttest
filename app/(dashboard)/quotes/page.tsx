import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function QuotesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Get all quotes with project info
  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      id,
      created_at,
      markup_percentage,
      final_price,
      projects!inner(
        id,
        client_name,
        property_address
      )
    `)
    .eq('projects.user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quotes</h1>
          <p className="text-muted-foreground">View and manage all your generated quotes</p>
        </div>

        {quotes && quotes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quotes.map((quote: any) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {quote.markup_percentage}% markup
                      </span>
                    </div>
                    
                    <h3 className="font-semibold mb-1">
                      {quote.projects.client_name || 'Unnamed Client'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {quote.projects.property_address || 'No address'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(quote.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        <DollarSign className="h-4 w-4" />
                        {quote.final_price.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No quotes yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start a new chat to create your first quote
              </p>
              <Button asChild>
                <Link href="/chat/new">Create New Quote</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}