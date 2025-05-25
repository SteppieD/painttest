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
    <Card className="border-[#e5e5e7] shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-[#1d1d1f]">Quote Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-[#8e8e93]">Cost Breakdown</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#6e6e73]">Labor</span>
              <span className="text-[#1d1d1f]">{formatCurrency(breakdown.labor)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6e6e73]">Paint</span>
              <span className="text-[#1d1d1f]">{formatCurrency(breakdown.paint)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6e6e73]">Supplies</span>
              <span className="text-[#1d1d1f]">{formatCurrency(breakdown.supplies)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e5e5e7] pt-4 space-y-2">
          <div className="flex justify-between font-medium">
            <span className="text-[#1d1d1f]">Base Cost</span>
            <span className="text-[#1d1d1f]">{formatCurrency(baseCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8e8e93]">Markup ({markup}%)</span>
            <span className="text-[#6e6e73]">{formatCurrency(markupAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[#e5e5e7]">
            <span className="text-[#1d1d1f]">Total Price</span>
            <span className="text-[#007aff]">{formatCurrency(finalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
