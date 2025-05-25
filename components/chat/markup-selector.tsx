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
    <Card className="border-[#e5e5e7] shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-[#1d1d1f]">Markup Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm text-[#8e8e93]">Base Cost</Label>
          <p className="text-2xl font-semibold text-[#1d1d1f]">{formatCurrency(baseCost)}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickOptions.map((markup) => (
            <Button
              key={markup}
              variant={selectedMarkup === markup && !isCustom ? 'default' : 'outline'}
              onClick={() => handleMarkupSelect(markup)}
              className={cn(
                'w-full',
                selectedMarkup === markup && !isCustom
                  ? 'bg-[#007aff] hover:bg-[#0051d5] text-white border-[#007aff]'
                  : 'border-[#e5e5e7] hover:bg-[#f7f7f8]'
              )}
            >
              {markup}%
            </Button>
          ))}
          <Button
            variant={isCustom ? 'default' : 'outline'}
            onClick={() => setIsCustom(true)}
            className={cn(
              'w-full',
              isCustom
                ? 'bg-[#007aff] hover:bg-[#0051d5] text-white border-[#007aff]'
                : 'border-[#e5e5e7] hover:bg-[#f7f7f8]'
            )}
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
              className="border-[#e5e5e7] focus:border-[#007aff]"
            />
            <Button 
              onClick={handleCustomMarkup}
              className="bg-[#007aff] hover:bg-[#0051d5]"
            >
              Apply
            </Button>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t border-[#e5e5e7]">
          <div className="flex justify-between">
            <span className="text-sm text-[#8e8e93]">Markup ({selectedMarkup}%)</span>
            <span className="font-medium text-[#1d1d1f]">{formatCurrency(finalPrice - baseCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-[#1d1d1f]">Final Price</span>
            <span className="text-xl font-semibold text-[#007aff]">{formatCurrency(finalPrice)}</span>
          </div>
          {showProfit && (
            <div className="flex justify-between pt-2 border-t border-[#e5e5e7]">
              <span className="text-sm font-medium text-[#1d1d1f]">Your Profit</span>
              <span className="font-semibold text-[#34c759]">{formatCurrency(profit)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
