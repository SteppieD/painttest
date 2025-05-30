import { Card } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-muted rounded-md animate-pulse" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6 h-48">
            <div className="space-y-4">
              <div className="h-5 w-1/2 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded-md animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
