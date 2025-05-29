'use client'

import { ArrowLeft, Download, Edit, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface QuoteViewerProps {
  quote: {
    id: string
    base_costs: any
    markup_percentage: number
    final_price: number
    details: any
    created_at: string
    project: {
      id: string
      client_name: string
      property_address: string
    }
  }
}

export function QuoteViewer({ quote }: QuoteViewerProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push(`/chat/${quote.project.id}`)
  }

  const handleEdit = () => {
    router.push(`/quotes/${quote.id}/edit`)
  }

  const handleDownload = () => {
    // This would trigger the PDF generation
    // For now, just navigate back to chat to use existing PDF generation
    router.push(`/chat/${quote.project.id}`)
  }

  const baseCosts = quote.base_costs as { labor: number; paint: number; supplies: number }
  const totalBaseCost = Object.values(baseCosts).reduce((sum, cost) => sum + cost, 0)
  const markup = (totalBaseCost * quote.markup_percentage) / 100

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Quote Details</h1>
            <p className="text-muted-foreground">
              Created {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Quote
          </Button>
          <Link href={`/quotes/${quote.id}/client`} target="_blank">
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Client Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Client</label>
            <p className="text-lg">{quote.project.client_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Property Address</label>
            <p className="text-lg">{quote.project.property_address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Labor</span>
              <span>{formatCurrency(baseCosts.labor)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paint</span>
              <span>{formatCurrency(baseCosts.paint)}</span>
            </div>
            <div className="flex justify-between">
              <span>Supplies</span>
              <span>{formatCurrency(baseCosts.supplies)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(totalBaseCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Markup ({quote.markup_percentage}%)</span>
              <span>{formatCurrency(markup)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(quote.final_price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      {quote.details && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(quote.details as any).rooms?.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-3">Scope of Work</h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="grid gap-3">
                      {/* Room Details */}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Rooms to Paint:</p>
                        <div className="space-y-2">
                          {(quote.details as any).rooms?.map((room: any, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-background rounded border">
                              <div>
                                <span className="font-medium">{room.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">({room.sqft} sqft)</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {[room.ceilingIncluded && 'Ceiling', room.trimIncluded && 'Trim']
                                  .filter(Boolean)
                                  .join(', ') || 'Walls only'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Summary Info */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Area</p>
                          <p className="font-medium">{(quote.details as any).totalSqft || 0} sqft</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Paint Quality</p>
                          <p className="font-medium capitalize">{(quote.details as any).paintQuality || 'Standard'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Number of Coats</p>
                          <p className="font-medium">{(quote.details as any).coats || 2}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gallons Needed</p>
                          <p className="font-medium">{Math.ceil(((quote.details as any).totalSqft || 0) / 350)} gallons</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No room details available</p>
                  <p className="text-sm mt-2">Total Square Footage: {(quote.details as any).totalSqft || 0} sqft</p>
                  <p className="text-sm">Paint Quality: {(quote.details as any).paintQuality || 'Standard'}</p>
                  <p className="text-sm">Coats: {(quote.details as any).coats || 2}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
