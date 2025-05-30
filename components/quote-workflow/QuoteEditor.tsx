'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { EnhancedBaseCosts } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { calculateTotalPrice } from '@/lib/quote-calculators'
import { Loader2, DollarSign, CalendarIcon, Save, X } from 'lucide-react'

interface QuoteEditorProps {
  quoteId: string
  initialData: {
    quoteNumber?: string
    validUntil: string
    finalPrice: number
    markupPercentage: number
    baseCosts: EnhancedBaseCosts
    details: any
    status?: string
  }
  onCancel: () => void
  onSave: () => void
}

export default function QuoteEditor({
  quoteId,
  initialData,
  onCancel,
  onSave
}: QuoteEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [validUntil, setValidUntil] = useState(initialData.validUntil || '')
  const [finalPrice, setFinalPrice] = useState(initialData.finalPrice || 0)
  const [markupPercentage, setMarkupPercentage] = useState(initialData.markupPercentage || 30)
  
  // Base costs state - pull from initial data or use defaults
  const [wallsSquareFootage, setWallsSquareFootage] = useState((initialData.baseCosts as any)?.wallsSquareFootage || 0)
  const [ceilingsSquareFootage, setCeilingsSquareFootage] = useState((initialData.baseCosts as any)?.ceilingsSquareFootage || 0) 
  const [wallsRate, setWallsRate] = useState((initialData.baseCosts as any)?.wallsRate || 0)
  const [ceilingsRate, setCeilingsRate] = useState((initialData.baseCosts as any)?.ceilingsRate || 0)
  const [paint, setPaint] = useState(initialData.baseCosts.paint || 0)
  const [labor, setLabor] = useState(initialData.baseCosts.labor || 0)
  const [supplies, setSupplies] = useState(initialData.baseCosts.supplies || 0)
  const [sundries, setSundries] = useState(initialData.baseCosts.sundries || 0)
  const [doorTrimWork, setDoorTrimWork] = useState(initialData.baseCosts.doorTrimWork || 0)
  const [baseboards, setBaseboards] = useState(initialData.baseCosts.baseboards || 0)
  
  // Project details state
  const [projectDetails, setProjectDetails] = useState(initialData.details || {})
  
  // Calculate subtotal based on current values
  const subtotal = labor + paint + supplies + sundries + (doorTrimWork || 0) + (baseboards || 0)
  
  // Recalculate final price when relevant fields change
  useEffect(() => {
    const newFinalPrice = calculateTotalPrice({
      baseCosts: {
        wallsSquareFootage,
        ceilingsSquareFootage,
        wallsRate,
        ceilingsRate,
        paint,
        labor,
        supplies,
        sundries,
        doorTrimWork,
        baseboards
      },
      markupPercentage
    })
    
    setFinalPrice(newFinalPrice)
  }, [wallsSquareFootage, ceilingsSquareFootage, wallsRate, ceilingsRate, paint, labor, supplies, sundries, doorTrimWork, baseboards, markupPercentage])
  
  // Handle saving changes
  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // Prepare the updated data
      const updatedData = {
        valid_until: validUntil,
        final_price: finalPrice,
        markup_percentage: markupPercentage,
        base_costs: {
          wallsSquareFootage,
          ceilingsSquareFootage,
          wallsRate,
          ceilingsRate,
          paint,
          labor,
          supplies,
          sundries,
          doorTrimWork,
          baseboards
        },
        details: projectDetails
      }
      
      // Update the quote in Supabase
      const { error } = await supabase
        .from('quotes')
        .update(updatedData)
        .eq('id', quoteId)
      
      if (error) throw error
      
      toast({
        title: 'Quote Updated',
        description: 'Your quote has been successfully updated.',
        variant: 'default'
      })
      
      // Call the onSave callback
      onSave()
    } catch (error) {
      console.error('Error updating quote:', error)
      toast({
        title: 'Error',
        description: 'Failed to update quote. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle simple quote details changes
  const handleSimpleDetailsChange = (serviceIndex: number, field: string, value: any) => {
    const updatedDetails = { ...projectDetails }
    
    if (!updatedDetails.services) {
      updatedDetails.services = []
    }
    
    if (!updatedDetails.services[serviceIndex]) {
      updatedDetails.services[serviceIndex] = {}
    }
    
    updatedDetails.services[serviceIndex][field] = value
    setProjectDetails(updatedDetails)
  }
  
  // Add a new service to simple quote
  const addService = () => {
    const updatedDetails = { ...projectDetails }
    
    if (!updatedDetails.services) {
      updatedDetails.services = []
    }
    
    updatedDetails.services.push({
      description: '',
      price: 0,
      show_price: false
    })
    
    setProjectDetails(updatedDetails)
  }
  
  // Remove a service from simple quote
  const removeService = (index: number) => {
    const updatedDetails = { ...projectDetails }
    updatedDetails.services.splice(index, 1)
    setProjectDetails(updatedDetails)
  }
  
  // Format expiration date for input
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch (error) {
      return new Date().toISOString().split('T')[0]
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Quote</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Quote Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        {/* Quote Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
              <CardDescription>Edit the basic information for this quote.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="validUntil"
                    type="date"
                    className="pl-10"
                    value={formatDateForInput(validUntil)}
                    onChange={(e) => setValidUntil(new Date(e.target.value).toISOString())}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Project Details</h3>
                
                {/* Simple quote services list */}
                <div className="space-y-4">
                  {projectDetails.services?.map((service: any, index: number) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start border p-3 rounded-md">
                      <div className="flex-grow space-y-2">
                        <Label htmlFor={`service-${index}-description`}>Description</Label>
                        <Input
                          id={`service-${index}-description`}
                          value={service.description || ''}
                          onChange={(e) => handleSimpleDetailsChange(index, 'description', e.target.value)}
                          placeholder="Service description"
                        />
                      </div>
                      
                      <div className="w-full md:w-32 space-y-2">
                        <Label htmlFor={`service-${index}-price`}>Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`service-${index}-price`}
                            type="number"
                            className="pl-8"
                            value={service.price || 0}
                            onChange={(e) => handleSimpleDetailsChange(index, 'price', Number(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-6"
                        onClick={() => removeService(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addService}
                  >
                    Add Service
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Modify the cost structure for this quote.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wallsSquareFootage">Walls Square Footage</Label>
                  <Input
                    id="wallsSquareFootage"
                    type="number"
                    value={wallsSquareFootage}
                    onChange={(e) => setWallsSquareFootage(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ceilingsSquareFootage">Ceilings Square Footage</Label>
                  <Input
                    id="ceilingsSquareFootage"
                    type="number"
                    value={ceilingsSquareFootage}
                    onChange={(e) => setCeilingsSquareFootage(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wallsRate">Walls Rate (per sq ft)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="wallsRate"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={wallsRate}
                      onChange={(e) => setWallsRate(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ceilingsRate">Ceilings Rate (per sq ft)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ceilingsRate"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={ceilingsRate}
                      onChange={(e) => setCeilingsRate(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paint">Paint Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="paint"
                      type="number"
                      className="pl-8"
                      value={paint}
                      onChange={(e) => setPaint(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="labor">Labor Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="labor"
                      type="number"
                      className="pl-8"
                      value={labor}
                      onChange={(e) => setLabor(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplies">Supplies Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="supplies"
                      type="number"
                      className="pl-8"
                      value={supplies}
                      onChange={(e) => setSupplies(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sundries">Sundries Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sundries"
                      type="number"
                      className="pl-8"
                      value={sundries}
                      onChange={(e) => setSundries(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doorTrimWork">Door & Trim Work</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="doorTrimWork"
                      type="number"
                      className="pl-8"
                      value={doorTrimWork}
                      onChange={(e) => setDoorTrimWork(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="baseboards">Baseboards</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="baseboards"
                      type="number"
                      className="pl-8"
                      value={baseboards}
                      onChange={(e) => setBaseboards(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="markupPercentage">Markup Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="markupPercentage"
                      type="number"
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>Overview of the quote pricing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Cost Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paint Cost:</span>
                    <span>{formatCurrency(paint)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labor Cost:</span>
                    <span>{formatCurrency(labor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplies Cost:</span>
                    <span>{formatCurrency(supplies)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sundries Cost:</span>
                    <span>{formatCurrency(sundries)}</span>
                  </div>
                  {doorTrimWork > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Door & Trim Work:</span>
                      <span>{formatCurrency(doorTrimWork)}</span>
                    </div>
                  )}
                  {baseboards > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Baseboards:</span>
                      <span>{formatCurrency(baseboards)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Markup ({markupPercentage}%):</span>
                    <span>{formatCurrency(subtotal * (markupPercentage / 100))}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 text-lg font-bold flex justify-between">
                    <span>Total Price:</span>
                    <span>{formatCurrency(finalPrice)}</span>
                  </div>
                </div>
              </div>
              
              {/* Manual price override */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Manual Price Override</h3>
                <div className="space-y-2">
                  <Label htmlFor="finalPrice">Final Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="finalPrice"
                      type="number"
                      className="pl-8"
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(Number(e.target.value))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this field to manually override the calculated price if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Save button at bottom for mobile */}
      <div className="md:hidden">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
