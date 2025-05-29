'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, calculateMarkup } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

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
  costSettings: any
}

export function QuoteEditor({ quote, costSettings }: QuoteEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Editable fields
  const [baseCosts, setBaseCosts] = useState(quote.base_costs as { labor: number; paint: number; supplies: number })
  const [markupPercentage, setMarkupPercentage] = useState(quote.markup_percentage)
  const [details, setDetails] = useState(quote.details)
  const [clientInfo, setClientInfo] = useState({
    name: quote.project.client_name,
    address: quote.project.property_address,
    email: quote.project.client_email || '',
    phone: quote.project.client_phone || ''
  })

  // Calculated values
  const totalBase = baseCosts.labor + baseCosts.paint + baseCosts.supplies
  const { finalPrice } = calculateMarkup(totalBase, markupPercentage)

  useEffect(() => {
    // Check if anything has changed
    const baseCostsObj = quote.base_costs as { labor: number; paint: number; supplies: number }
    const originalTotal = baseCostsObj.labor + baseCostsObj.paint + baseCostsObj.supplies
    const currentTotal = totalBase
    const hasBaseCostChanges = Math.abs(currentTotal - originalTotal) > 0.01
    const hasMarkupChanges = markupPercentage !== quote.markup_percentage
    const hasClientChanges = (
      clientInfo.name !== quote.project.client_name ||
      clientInfo.address !== quote.project.property_address ||
      clientInfo.email !== (quote.project.client_email || '') ||
      clientInfo.phone !== (quote.project.client_phone || '')
    )

    setHasChanges(hasBaseCostChanges || hasMarkupChanges || hasClientChanges)
  }, [baseCosts, markupPercentage, clientInfo, quote, totalBase])

  const handleBaseCostChange = (field: 'labor' | 'paint' | 'supplies', value: number) => {
    setBaseCosts(prev => ({ ...prev, [field]: value }))
  }

  const handleRecalculateCosts = () => {
    if (!costSettings || !details) return

    const costs = costSettings || {
      labor_cost_per_hour: 25,
      paint_costs: { good: 25, better: 35, best: 50 },
      supplies_base_cost: 100
    }

    const totalSqft = details.totalSqft || 0
    const paintQuality = details.paintQuality || 'better'
    
    // Recalculate based on current settings
    const laborHours = Math.ceil((totalSqft / 400) * 8) // 8 hours per 400 sqft
    const paintGallons = Math.ceil(totalSqft / 400)
    const paintCostPerGallon = costs.paint_costs[paintQuality] || costs.paint_costs.better
    
    const newBaseCosts = {
      labor: laborHours * costs.labor_cost_per_hour,
      paint: paintGallons * paintCostPerGallon,
      supplies: costs.supplies_base_cost
    }

    setBaseCosts(newBaseCosts)
    toast({
      title: "Costs Recalculated",
      description: "Base costs have been updated based on current settings.",
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      // Update project info
      await supabase
        .from('projects')
        .update({
          client_name: clientInfo.name,
          property_address: clientInfo.address,
          client_email: clientInfo.email || null,
          client_phone: clientInfo.phone || null
        })
        .eq('id', quote.project.id)

      // Create new quote version
      const { data: currentQuote } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quote.id)
        .single()

      if (currentQuote) {
        // Get the latest version number
        const { data: versions } = await supabase
          .from('quote_versions')
          .select('version')
          .eq('quote_id', quote.id)
          .order('version', { ascending: false })
          .limit(1)

        const nextVersion = (versions?.[0]?.version || 0) + 1

        // Save current quote as a version
        await supabase
          .from('quote_versions')
          .insert({
            quote_id: quote.id,
            version: nextVersion - 1,
            base_costs: quote.base_costs,
            markup_percentage: quote.markup_percentage,
            final_price: quote.final_price,
            details: quote.details,
            changes: {
              timestamp: new Date().toISOString(),
              description: 'Quote updated'
            },
            created_by: (await supabase.auth.getUser()).data.user?.id || ''
          })

        // Update the main quote
        await supabase
          .from('quotes')
          .update({
            base_costs: baseCosts,
            markup_percentage: markupPercentage,
            final_price: finalPrice,
            details: details
          })
          .eq('id', quote.id)
      }

      toast({
        title: "Quote Updated",
        description: "Your changes have been saved successfully.",
      })

      setHasChanges(false)
      router.push(`/quotes/${quote.id}`)
    } catch (error) {
      console.error('Error saving quote:', error)
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Quote</h1>
            <p className="text-muted-foreground">
              Last updated {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecalculateCosts}>
            <Calculator className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Warning */}
      {quote.status === 'accepted' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-amber-800 font-medium">
              ⚠️ This quote has been accepted by the client. Changes will create a new version.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                value={clientInfo.name}
                onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="client@email.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="property-address">Property Address</Label>
            <Textarea
              id="property-address"
              value={clientInfo.address}
              onChange={(e) => setClientInfo(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="labor-cost">Labor Cost</Label>
              <Input
                id="labor-cost"
                type="number"
                value={baseCosts.labor}
                onChange={(e) => handleBaseCostChange('labor', parseFloat(e.target.value) || 0)}
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="paint-cost">Paint Cost</Label>
              <Input
                id="paint-cost"
                type="number"
                value={baseCosts.paint}
                onChange={(e) => handleBaseCostChange('paint', parseFloat(e.target.value) || 0)}
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="supplies-cost">Supplies Cost</Label>
              <Input
                id="supplies-cost"
                type="number"
                value={baseCosts.supplies}
                onChange={(e) => handleBaseCostChange('supplies', parseFloat(e.target.value) || 0)}
                step="0.01"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal:</span>
              <span>{formatCurrency(totalBase)}</span>
            </div>
            
            <div className="space-y-3">
              <Label>Markup Percentage: {markupPercentage}%</Label>
              <Slider
                value={[markupPercentage]}
                onValueChange={(value) => setMarkupPercentage(value[0])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>Markup Amount:</span>
                <span>{formatCurrency((totalBase * markupPercentage) / 100)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>Final Price:</span>
              <span>{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      {details && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Total Square Footage</Label>
                  <Input
                    type="number"
                    value={details.totalSqft || 0}
                    onChange={(e) => setDetails((prev: any) => ({ ...prev, totalSqft: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Paint Quality</Label>
                  <Select 
                    value={details.paintQuality || 'better'} 
                    onValueChange={(value) => setDetails((prev: any) => ({ ...prev, paintQuality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="better">Better</SelectItem>
                      <SelectItem value="best">Best</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Coats</Label>
                  <Select 
                    value={details.coats?.toString() || '2'} 
                    onValueChange={(value) => setDetails((prev: any) => ({ ...prev, coats: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Coat</SelectItem>
                      <SelectItem value="2">2 Coats</SelectItem>
                      <SelectItem value="3">3 Coats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Gallons Needed</Label>
                  <Input
                    type="number"
                    value={Math.ceil((details.totalSqft || 0) / 350)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              {details.rooms && details.rooms.length > 0 && (
                <div>
                  <Label className="text-base font-semibold">Room Details</Label>
                  <div className="mt-2 space-y-2">
                    {details.rooms.map((room: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded">
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
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Reminder */}
      {hasChanges && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-blue-800">
              💡 You have unsaved changes. Don&apos;t forget to save before leaving!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}