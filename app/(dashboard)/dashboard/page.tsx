import { createClient } from '@/lib/supabase/server'
import { Plus, FileText, ChartBar } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch recent quotes with project info
  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      *,
      project:projects (
        client_name,
        property_address
      )
    `)
    .in('project_id', 
      (await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
      ).data?.map(p => p.id) || []
    )
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Professional Painting Quotes 🎨</h1>
        <p className="text-muted-foreground">Accurate quotes, professional results</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Link href="/chat/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">New Painting Quote</h3>
              <p className="text-sm text-muted-foreground">Get instant painting estimates</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/quotes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">View Quotes</h3>
              <p className="text-sm text-muted-foreground">Manage painting quotes</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/insights">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Insights</h3>
              <p className="text-sm text-muted-foreground">Business analytics & trends</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Quotes */}
      {quotes && quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{quote.project.client_name}</p>
                    <p className="text-sm text-muted-foreground">{quote.project.property_address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(quote.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(quote.final_price)}</p>
                    <Link href={`/quotes/${quote.id}`}>
                      <Button size="sm" variant="outline" className="mt-1">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/quotes">
                <Button variant="outline">View All Quotes</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
