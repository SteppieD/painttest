'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Plus, ArrowUpRight, Calendar, DollarSign, BarChart2, Clock, FileText } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import QuoteDashboardSummary from '@/components/dashboard/QuoteDashboardSummary'

interface QuoteWithProject {
  id: string
  final_price: number
  created_at: string
  valid_until: string
  projects: {
    client_name: string
    property_address: string
    user_id: string
  }
}

interface DashboardStats {
  totalQuotes: number
  totalRevenue: number
  averageQuoteValue: number
  activeQuotes: number
  expiredQuotes: number
  quotesThisMonth: number
  revenueThisMonth: number
}

interface RecentQuote {
  id: string
  client_name: string
  property_address: string
  final_price: number
  created_at: string
  valid_until: string
  status: 'active' | 'expired'
}

interface MonthlyData {
  month: string
  quotes: number
  revenue: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useSupabase()
  
  // Debug log to see if dashboard page is reached
  console.log('🏠 Dashboard page loaded')
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    totalRevenue: 0,
    averageQuoteValue: 0,
    activeQuotes: 0,
    expiredQuotes: 0,
    quotesThisMonth: 0,
    revenueThisMonth: 0
  })
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Check for Supabase user first
        const { data: { user } } = await supabase.auth.getUser()
        
        // If no Supabase user, check for access code session
        if (!user) {
          const sessionData = localStorage.getItem('paintquote_session')
          if (sessionData) {
            try {
              const parsed = JSON.parse(sessionData)
              if (Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000) {
                // Use demo data for access code users instead of database queries
                setStats({
                  totalQuotes: 3,
                  totalRevenue: 15650,
                  averageQuoteValue: 5216.67,
                  activeQuotes: 2,
                  expiredQuotes: 1,
                  quotesThisMonth: 2,
                  revenueThisMonth: 10450
                })
                
                setRecentQuotes([
                  {
                    id: 'demo-1',
                    client_name: 'Sarah Johnson',
                    property_address: '123 Main Street, Anytown, USA',
                    final_price: 7475,
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    valid_until: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active' as const
                  },
                  {
                    id: 'demo-2',
                    client_name: 'Mike Wilson',
                    property_address: '456 Oak Avenue, Springfield',
                    final_price: 3200,
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    valid_until: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active' as const
                  },
                  {
                    id: 'demo-3',
                    client_name: 'Jennifer Davis',
                    property_address: '789 Pine Street, Riverside',
                    final_price: 4975,
                    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
                    valid_until: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'expired' as const
                  }
                ])
                
                setMonthlyData([
                  { month: 'Sep 2024', quotes: 1, revenue: 4975 },
                  { month: 'Oct 2024', quotes: 0, revenue: 0 },
                  { month: 'Nov 2024', quotes: 1, revenue: 3200 },
                  { month: 'Dec 2024', quotes: 0, revenue: 0 },
                  { month: 'Jan 2025', quotes: 1, revenue: 7475 },
                  { month: 'Feb 2025', quotes: 0, revenue: 0 }
                ])
                
                setIsLoading(false)
                return
              }
            } catch {
              // Invalid session
            }
          }
          router.push('/access-code')
          return
        }

        // Fetch quotes with project data
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select(`
            id,
            final_price,
            created_at,
            valid_until,
            projects!inner(
              client_name,
              property_address,
              user_id
            )
          `)
          .eq('projects.user_id', user.id)
          .order('created_at', { ascending: false })

        if (quotesError) throw quotesError

        // Make sure we have the correct types
        const quotesWithProjects = quotes as unknown as QuoteWithProject[]
        
        // Calculate statistics
        if (quotesWithProjects && quotesWithProjects.length > 0) {
          const now = new Date()
          const totalRevenue = quotesWithProjects.reduce((sum, quote) => sum + quote.final_price, 0)
          const activeQuotes = quotesWithProjects.filter(quote => new Date(quote.valid_until) >= now).length
          const expiredQuotes = quotesWithProjects.length - activeQuotes
          
          // This month's data
          const thisMonth = now.getMonth()
          const thisYear = now.getFullYear()
          const thisMonthQuotes = quotesWithProjects.filter(quote => {
            const quoteDate = new Date(quote.created_at)
            return quoteDate.getMonth() === thisMonth && quoteDate.getFullYear() === thisYear
          })
          const thisMonthRevenue = thisMonthQuotes.reduce((sum, quote) => sum + quote.final_price, 0)

          // Monthly data for charts
          const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            return {
              month: date.toLocaleString('default', { month: 'short' }),
              year: date.getFullYear(),
              monthIndex: date.getMonth(),
              quotes: 0,
              revenue: 0
            }
          }).reverse()

          // Populate monthly data
          quotesWithProjects.forEach(quote => {
            const quoteDate = new Date(quote.created_at)
            const monthData = lastSixMonths.find(m => 
              m.monthIndex === quoteDate.getMonth() && m.year === quoteDate.getFullYear()
            )
            if (monthData) {
              monthData.quotes += 1
              monthData.revenue += quote.final_price
            }
          })

          // Format for chart display
          const chartData = lastSixMonths.map(m => ({
            month: `${m.month} ${m.year}`,
            quotes: m.quotes,
            revenue: m.revenue
          }))

          setMonthlyData(chartData)
          setStats({
            totalQuotes: quotesWithProjects.length,
            totalRevenue,
            averageQuoteValue: totalRevenue / quotesWithProjects.length,
            activeQuotes,
            expiredQuotes,
            quotesThisMonth: thisMonthQuotes.length,
            revenueThisMonth: thisMonthRevenue
          })

          // Format recent quotes
          const formattedRecentQuotes = quotesWithProjects.slice(0, 5).map(quote => {
            const isActive = new Date(quote.valid_until) >= now;
            return {
              id: quote.id,
              client_name: quote.projects.client_name,
              property_address: quote.projects.property_address,
              final_price: quote.final_price,
              created_at: quote.created_at,
              valid_until: quote.valid_until,
              status: isActive ? 'active' as const : 'expired' as const
            };
          })
          setRecentQuotes(formattedRecentQuotes)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase, router])

  const handleNewQuote = () => {
    router.push('/chat/new')
  }

  const handleViewQuote = (quoteId: string) => {
    router.push(`/quotes/${quoteId}`)
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <Button onClick={handleNewQuote}>
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.totalQuotes}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? '...' : `${stats.activeQuotes} active, ${stats.expiredQuotes} expired`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. {isLoading ? '...' : formatCurrency(stats.averageQuoteValue)} per quote
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.quotesThisMonth} quotes
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? '...' : formatCurrency(stats.revenueThisMonth)} revenue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.totalQuotes > 0 ? 
                    `${Math.round((stats.activeQuotes / stats.totalQuotes) * 100)}%` : 
                    '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Of all quotes created
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Business Performance</CardTitle>
              <CardDescription>
                Track your business performance metrics including quote acceptance, actual costs, and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteDashboardSummary />
            </CardContent>
          </Card>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Quotes</CardTitle>
                <CardDescription>Number of quotes generated per month</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 40,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="quotes" fill="#8884d8" name="Quotes" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue from quotes</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 40,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#82ca9d" 
                          name="Revenue"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quotes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Quotes</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/quotes')}>
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-48"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentQuotes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No quotes yet</p>
                  <Button className="mt-4" onClick={handleNewQuote}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Quote
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentQuotes.map((quote) => (
                    <div 
                      key={quote.id}
                      className="flex justify-between items-center py-3 px-4 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleViewQuote(quote.id)}
                    >
                      <div>
                        <div className="font-medium">{quote.client_name}</div>
                        <div className="text-sm text-muted-foreground">{quote.property_address}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(quote.final_price)}</div>
                        <div className="flex items-center text-xs">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className={quote.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                            {quote.status === 'active' ? 'Active' : 'Expired'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
