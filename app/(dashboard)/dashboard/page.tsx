import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/database'
import { Plus, FileText, ChartBar } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const auth = await requireAuth()
  
  if (!auth) {
    redirect('/login')
  }

  const { company } = auth

  // Get recent projects
  const projects = await db.project.findMany({
    where: { companyId: company.id },
    include: {
      quotes: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  // Get quotes statistics
  const quotesStats = await db.quote.groupBy({
    by: ['status'],
    where: {
      project: {
        companyId: company.id
      }
    },
    _count: {
      status: true
    }
  })

  const totalQuotes = quotesStats.reduce((sum, stat) => sum + stat._count.status, 0)
  const acceptedQuotes = quotesStats.find(s => s.status === 'accepted')?._count.status || 0
  const acceptanceRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {company.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/quotes/chat/new">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Quotes generated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Quotes accepted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Button asChild>
                <Link href="/quotes/chat/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Quote
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{project.clientName}</h3>
                    <p className="text-sm text-muted-foreground">{project.propertyAddress}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(project.createdAt))} ago
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.quotes[0] && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/quotes/${project.quotes[0].id}`}>
                          View Quote
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/quotes/chat/${project.id}`}>
                        Open Chat
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}