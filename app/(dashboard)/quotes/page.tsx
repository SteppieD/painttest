import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/database'
import Link from 'next/link'
import { FileText, Calendar, DollarSign, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function QuotesPage() {
  const auth = await requireAuth()
  
  if (!auth) {
    redirect('/login')
  }

  const { company } = auth

  // Get all quotes for this company
  const quotes = await db.quote.findMany({
    where: {
      project: {
        companyId: company.id
      }
    },
    include: {
      project: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Manage all your painting quotes
          </p>
        </div>
        <Button asChild>
          <Link href="/quotes/chat/new">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Link>
        </Button>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No quotes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first quote to get started
            </p>
            <Button asChild>
              <Link href="/quotes/chat/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Quote
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{quote.project.clientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {quote.project.propertyAddress}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(quote.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(quote.total)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/quotes/${quote.id}`}>
                      View
                    </Link>
                  </Button>
                  {quote.status === 'draft' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/quotes/${quote.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}