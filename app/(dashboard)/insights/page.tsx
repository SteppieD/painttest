import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InsightsPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Analytics and insights for your painting business
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Business insights and analytics will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}