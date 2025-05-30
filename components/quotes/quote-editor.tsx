'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, calculateMarkup } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface QuoteEditorProps {
  quote: {
    id: string
    base_costs: any
    markup_percentage: number
    final_price: number
    details: any
    status: string
    created_at: string
    project: {
      id: string
      client_name: string
      property_address: string
      client_email?: string
      client_phone?: string
    }
  }
  costSettings: {
    labor_cost_per_hour: number
    paint_costs: {
      good: number
      better: number
      best: number
    }
    supplies_base_cost: number
  }
}

export function QuoteEditor({ quote, costSettings }: QuoteEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  
  const [clientInfo, setClientInfo] = useState({
    name: quote.project.client_name,
    address: quote.project.property_address,
    email: quote.project.client_email || '',
    phone: quote.project.client_phone || ''
  })
  
  const [laborHours, setLaborHours] = useState(quote.base_costs?.labor?.hours || 0)
  const [paintGallons, setPaintGallons] = useState(quote.base_costs?.paint?.gallons || 0)
  const [paintQuality, setPaintQuality] = useState(quote.base_costs?.paint?.quality || 'good')
  const [suppliesCost, setSuppliesCost] = useState(quote.base_costs?.supplies || 100)
  const [markupPercentage, setMarkupPercentage] = useState(quote.markup_percentage || 20)
  const [notes, setNotes] = useState(quote.details?.notes || '')

  const baseCosts = {
    labor: laborHours * costSettings.labor_cost_per_hour,
    paint: paintGallons * costSettings.paint_costs[paintQuality as keyof typeof costSettings.paint_costs],
    supplies: suppliesCost
  }

  const subtotal = baseCosts.labor + baseCosts.paint + baseCosts.supplies
  const markupResult = calculateMarkup(subtotal, markupPercentage)
  const markupAmount = markupResult.markupAmount
  const finalPrice = markupResult.finalPrice

  const handleSave = async () => {
    setSaving(true)
    
    // Simulate save delay
    setTimeout(() => {
      toast({
        title: "Quote Saved",
        description: "Your changes have been saved successfully.",
      })
      setSaving(false)
      router.push(`/quotes/${quote.id}`)
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Quote</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/quotes/${quote.id}`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientInfo.name}
                onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                id="propertyAddress"
                value={clientInfo.address}
                onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Labor */}
          <div>
            <Label>Labor Hours: {laborHours}</Label>
            <Slider
              value={[laborHours]}
              onValueChange={([value]) => setLaborHours(value)}
              max={200}
              step={1}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {laborHours} hours × {formatCurrency(costSettings.labor_cost_per_hour)}/hour = {formatCurrency(baseCosts.labor)}
            </p>
          </div>

          {/* Paint */}
          <div>
            <Label>Paint Gallons: {paintGallons}</Label>
            <Slider
              value={[paintGallons]}
              onValueChange={([value]) => setPaintGallons(value)}
              max={50}
              step={1}
              className="mt-2"
            />
            <div className="mt-2">
              <Label>Paint Quality</Label>
              <Select value={paintQuality} onValueChange={setPaintQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good - {formatCurrency(costSettings.paint_costs.good)}/gal</SelectItem>
                  <SelectItem value="better">Better - {formatCurrency(costSettings.paint_costs.better)}/gal</SelectItem>
                  <SelectItem value="best">Best - {formatCurrency(costSettings.paint_costs.best)}/gal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {paintGallons} gallons × {formatCurrency(costSettings.paint_costs[paintQuality as keyof typeof costSettings.paint_costs])}/gallon = {formatCurrency(baseCosts.paint)}
            </p>
          </div>

          {/* Supplies */}
          <div>
            <Label htmlFor="supplies">Supplies & Materials</Label>
            <Input
              id="supplies"
              type="number"
              value={suppliesCost}
              onChange={(e) => setSuppliesCost(Number(e.target.value))}
              className="mt-2"
            />
          </div>

          {/* Markup */}
          <div>
            <Label>Markup Percentage: {markupPercentage}%</Label>
            <Slider
              value={[markupPercentage]}
              onValueChange={([value]) => setMarkupPercentage(value)}
              max={50}
              step={5}
              className="mt-2"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
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
            <div className="flex justify-between pt-2 border-t">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Markup ({markupPercentage}%)</span>
              <span>{formatCurrency(markupAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Total Quote</span>
              <span className="text-primary">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}