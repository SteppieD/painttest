'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, FileText, CheckCircle2, BarChart3, Calculator, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function QuoteDashboardSummary() {
  const supabase = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuotes: 0,
    totalQuotesValue: 0,
    acceptedQuotes: 0,
    acceptedQuotesValue: 0,
    totalActualMaterials: 0,
    totalActualLabor: 0,
    totalProfit: 0
  })
  
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setIsLoading(true)
        
        // Get the user ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        // Fetch all quotes for the user
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          
        if (quotesError) throw quotesError
        
        if (quotes) {
          // Calculate stats
          const totalQuotes = quotes.length
          const totalQuotesValue = quotes.reduce((sum, quote) => sum + (quote.final_price || 0), 0)
          
          const acceptedQuotes = quotes.filter(q => 
            q.job_status === 'accepted' || q.job_status === 'completed'
          )
          const acceptedQuotesCount = acceptedQuotes.length
          const acceptedQuotesValue = acceptedQuotes.reduce((sum, quote) => 
            sum + (quote.final_price || 0), 0
          )
          
          // Get completed quotes with actuals
          const completedQuotes = quotes.filter(q => q.job_status === 'completed')
          const totalActualMaterials = completedQuotes.reduce((sum, quote) => 
            sum + (quote.actual_materials_cost || 0), 0
          )
          const totalActualLabor = completedQuotes.reduce((sum, quote) => 
            sum + (quote.actual_labor_cost || 0), 0
          )
          const totalActualSupplies = completedQuotes.reduce((sum, quote) => 
            sum + (quote.actual_supplies_cost || 0), 0
          )
          
          // Calculate total profit
          const totalRevenue = completedQuotes.reduce((sum, quote) => 
            sum + (quote.final_price || 0), 0
          )
          const totalCosts = totalActualMaterials + totalActualLabor + totalActualSupplies
          const totalProfit = totalRevenue - totalCosts
          
          setStats({
            totalQuotes,
            totalQuotesValue,
            acceptedQuotes: acceptedQuotesCount,
            acceptedQuotesValue,
            totalActualMaterials,
            totalActualLabor,
            totalProfit
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardStats()
  }, [supabase])
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-muted rounded w-1/3"></CardTitle>
              <div className="h-8 w-8 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="text-xs h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  const cards = [
    {
      title: "Total Quotes",
      value: stats.totalQuotes,
      description: `Total value: ${formatCurrency(stats.totalQuotesValue)}`,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Accepted Quotes",
      value: stats.acceptedQuotes,
      description: `Total value: ${formatCurrency(stats.acceptedQuotesValue)}`,
      icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Acceptance Rate",
      value: stats.totalQuotes ? `${Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100)}%` : "0%",
      description: `${stats.acceptedQuotes} out of ${stats.totalQuotes} quotes`,
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Material Costs",
      value: formatCurrency(stats.totalActualMaterials),
      description: "Actual material costs from completed jobs",
      icon: <Calculator className="h-4 w-4 text-muted-foreground" />,
      color: "bg-orange-100 text-orange-700"
    },
    {
      title: "Labor Costs",
      value: formatCurrency(stats.totalActualLabor),
      description: "Actual labor costs from completed jobs",
      icon: <Calculator className="h-4 w-4 text-muted-foreground" />,
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      title: "Total Profit",
      value: formatCurrency(stats.totalProfit),
      description: "Profit from completed jobs",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      color: `${stats.totalProfit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`
    }
  ]
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.color}`}>
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
