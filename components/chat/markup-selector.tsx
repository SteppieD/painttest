'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, calculateMarkup } from '@/lib/utils'

interface MarkupSelectorProps {
  baseCost: number
  onMarkupChange: (markup: number) => void
  quickOptions?: number[]
  showProfit?: boolean
}

export function MarkupSelector({
  baseCost,
  onMarkupChange,
  quickOptions = [10, 15, 20, 25, 30],
  showProfit = true
}: MarkupSelectorProps) {
  const [selectedMarkup, setSelectedMarkup] = useState(20)
  const [customMarkup, setCustomMarkup] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const handleMarkupSelect = (markup: number) => {
    setSelectedMarkup(markup)
    setIsCustom(false)
    setCustomMarkup('')
    onMarkupChange(markup)
  }

  const handleCustomMarkup = () => {
    const markup = parseFloat(customMarkup)
    if (!isNaN(markup) && markup >= 0 && markup <= 100) {
      setSelectedMarkup(markup)
      setIsCustom(true)
      onMarkupChange(markup)
    }
  }

  const { finalPrice, profit } = calculateMarkup(baseCost, selectedMarkup)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Markup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">Base Cost</Label>
          <p className="text-2xl font-bold">{formatCurrency(baseCost)}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickOptions.map((markup) => (
            <Button
              key={markup}
              variant={selectedMarkup === markup && !isCustom ? 'default' : 'outline'}
              onClick={() => handleMarkupSelect(markup)}
              className="w-full"
            >
              {markup}%
            </Button>
          ))}
          <Button
            variant={isCustom ? 'default' : 'outline'}
            onClick={() => setIsCustom(true)}
            className="w-full"
          >
            Custom
          </Button>
        </div>

        {isCustom && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter markup %"
              value={customMarkup}
              onChange={(e) => setCustomMarkup(e.target.value)}
              min="0"
              max="100"
            />
            <Button onClick={handleCustomMarkup}>Apply</Button>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Markup ({selectedMarkup}%)</span>
            <span className="font-medium">{formatCurrency(finalPrice - baseCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Final Price</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(finalPrice)}</span>
          </div>
          {showProfit && (
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm font-medium">Your Profit</span>
              <span className="font-bold text-success">{formatCurrency(profit)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
