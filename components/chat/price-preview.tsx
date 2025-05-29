'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateMarkup } from '@/lib/utils'
import { FileText, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'

interface PricePreviewProps {
  baseCosts: {
    labor: number
    paint: number
    supplies: number
  }
  markup: number
  onGenerateQuote?: () => void
  isGenerating?: boolean
  quoteId?: string | null
}

export function PricePreview({ 
  baseCosts, 
  markup, 
  onGenerateQuote,
  isGenerating = false,
  quoteId
}: PricePreviewProps) {
  const totalBase = baseCosts.labor + baseCosts.paint + baseCosts.supplies
  const { finalPrice, profit } = calculateMarkup(totalBase, markup)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Painting Quote Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Labor Cost</span>
            <span>{formatCurrency(baseCosts.labor)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paint Cost</span>
            <span>{formatCurrency(baseCosts.paint)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Supplies Cost</span>
            <span>{formatCurrency(baseCosts.supplies)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="font-medium">Base Cost</span>
            <span className="font-medium">{formatCurrency(totalBase)}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Markup ({markup}%)</span>
            <span>{formatCurrency(profit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Final Price</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(finalPrice)}</span>
          </div>
        </div>

        {quoteId ? (
          <div className="flex gap-2">
            <Link href={`/quotes/${quoteId}`} className="flex-1">
              <Button className="w-full" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Business Quote
              </Button>
            </Link>
            <Link href={`/quotes/${quoteId}/client`} className="flex-1">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Client Quote
              </Button>
            </Link>
          </div>
        ) : (
          onGenerateQuote && (
            <Button 
              onClick={onGenerateQuote} 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Quote...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Quote
                </>
              )}
            </Button>
          )
        )}

        <p className="text-xs text-muted-foreground text-center">
          {quoteId ? 'Quote generated successfully' : 'Adjust markup before generating'}
        </p>
      </CardContent>
    </Card>
  )
}
