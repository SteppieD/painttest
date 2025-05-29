import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, DollarSign, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function InsightsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all projects for the user
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.id)

  const projectIds = projects?.map(p => p.id) || []

  // Fetch quotes statistics
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .in('project_id', projectIds)

  // Calculate metrics
  const totalQuotes = quotes?.length || 0
  const acceptedQuotes = quotes?.filter(q => q.status === 'accepted').length || 0
  const totalQuoteValue = quotes?.reduce((sum, q) => sum + q.final_price, 0) || 0
  const acceptedQuoteValue = quotes?.filter(q => q.status === 'accepted')
    .reduce((sum, q) => sum + q.final_price, 0) || 0
  
  const averageQuoteValue = totalQuotes > 0 ? totalQuoteValue / totalQuotes : 0
  const acceptanceRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0

  // Get current month quotes
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const monthlyQuotes = quotes?.filter(q => 
    new Date(q.created_at) >= startOfMonth
  ).length || 0

  const metrics = [
    {
      title: 'Total Quotes',
      value: totalQuotes,
      subtitle: `${monthlyQuotes} this month`,
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'Total Quote Value',
      value: formatCurrency(totalQuoteValue),
      subtitle: `Avg: ${formatCurrency(averageQuoteValue)}`,
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'Accepted Quotes',
      value: acceptedQuotes,
      subtitle: `${acceptanceRate.toFixed(0)}% acceptance rate`,
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: 'Revenue Potential',
      value: formatCurrency(acceptedQuoteValue),
      subtitle: 'From accepted quotes',
      icon: TrendingUp,
      color: 'text-primary'
    }
  ]

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Track your business performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.subtitle}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/chat/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Quote
              </Button>
            </Link>
            <Link href="/quotes">
              <Button variant="outline">
                View All Quotes
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">
                Update Cost Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Quotes Summary */}
      {quotes && quotes.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotes.slice(0, 5).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Quote #{quote.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(quote.final_price)}</p>
                    <span className={`text-xs inline-flex items-center px-2 py-0.5 rounded-full
                      ${quote.status === 'accepted' ? 'bg-success/10 text-success' : ''}
                      ${quote.status === 'sent' ? 'bg-primary/10 text-primary' : ''}
                      ${quote.status === 'draft' ? 'bg-muted text-muted-foreground' : ''}
                    `}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}