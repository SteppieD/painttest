import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { BaseCosts } from '@/types/database'

interface PricePreviewProps {
  baseCost: number
  markup: number
  breakdown: BaseCosts
}

export function PricePreview({ baseCost, markup, breakdown }: PricePreviewProps) {
  const markupAmount = baseCost * (markup / 100)
  const finalPrice = baseCost + markupAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Cost Breakdown</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Labor</span>
              <span>{formatCurrency(breakdown.labor)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Paint</span>
              <span>{formatCurrency(breakdown.paint)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Supplies</span>
              <span>{formatCurrency(breakdown.supplies)}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between font-medium">
            <span>Base Cost</span>
            <span>{formatCurrency(baseCost)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Markup ({markup}%)</span>
            <span>{formatCurrency(markupAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-primary">
            <span>Total Price</span>
            <span>{formatCurrency(finalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
