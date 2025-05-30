'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'
import { setupCompanySettingsClient, addPaintProductClient } from '@/lib/company-setup-client'
import { DoorTrimPricing, BaseboardPricing, DefaultRates, DefaultPaintCosts } from '@/types/database'

export default function SetupPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  // Step 1: Basic Company Info
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  
  // Step 2: Default Settings
  const [laborPercentage, setLaborPercentage] = useState(30)
  const [spreadRate, setSpreadRate] = useState(350)
  const [doorUnitPrice, setDoorUnitPrice] = useState(45)
  const [trimLinearFootPrice, setTrimLinearFootPrice] = useState(3)
  const [baseboardMethod, setBaseboardMethod] = useState<'linear_foot' | 'included'>('linear_foot')
  const [baseboardPrice, setBaseboardPrice] = useState(2.5)
  
  // Step 3: Surface Rates
  const [wallsRate, setWallsRate] = useState(3.00)
  const [ceilingsRate, setCeilingsRate] = useState(2.00)
  const [trimDoorsRate, setTrimDoorsRate] = useState(5.00)
  
  // Step 4: Paint Costs
  const [wallsPaintCost, setWallsPaintCost] = useState(26)
  const [ceilingsPaintCost, setCeilingsPaintCost] = useState(25)
  const [trimDoorsPaintCost, setTrimDoorsPaintCost] = useState(35)
  
  // Step 5: Paint Products
  const [addingProducts, setAddingProducts] = useState(false)
  const [paintProducts, setPaintProducts] = useState<Array<{
    productName: string;
    useCase: 'walls' | 'ceilings' | 'trim' | 'doors';
    costPerGallon: number;
    sheen?: string;
  }>>([])
  const [currentProduct, setCurrentProduct] = useState({
    productName: '',
    useCase: 'walls' as 'walls' | 'ceilings' | 'trim' | 'doors',
    costPerGallon: 0,
    sheen: ''
  })

  const nextStep = () => {
    if (step === 1 && !companyName.trim()) {
      toast({
        title: 'Company name required',
        description: 'Please enter your company name to continue.',
        variant: 'destructive'
      })
      return
    }
    
    if (step < 5) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const addProduct = () => {
    if (!currentProduct.productName.trim() || currentProduct.costPerGallon <= 0) {
      toast({
        title: 'Invalid product',
        description: 'Please enter a product name and valid cost per gallon.',
        variant: 'destructive'
      })
      return
    }
    
    setPaintProducts([...paintProducts, { ...currentProduct }])
    setCurrentProduct({
      productName: '',
      useCase: 'walls',
      costPerGallon: 0,
      sheen: ''
    })
  }

  const removeProduct = (index: number) => {
    const newProducts = [...paintProducts]
    newProducts.splice(index, 1)
    setPaintProducts(newProducts)
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_name: companyName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Setup door trim pricing
      const doorTrimPricing: DoorTrimPricing = {
        door_unit_price: doorUnitPrice,
        trim_linear_foot_price: trimLinearFootPrice
      }
      
      // Setup baseboard pricing
      const baseboardPricing: BaseboardPricing = {
        charge_method: baseboardMethod,
        price_per_linear_foot: baseboardPrice
      }
      
      // Setup default rates
      const defaultRates: DefaultRates = {
        walls: wallsRate,
        ceilings: ceilingsRate,
        trim_doors: trimDoorsRate
      }
      
      // Setup default paint costs
      const defaultPaintCosts: DefaultPaintCosts = {
        walls: wallsPaintCost,
        ceilings: ceilingsPaintCost,
        trim_doors: trimDoorsPaintCost
      }
      
      // Setup company settings
      await setupCompanySettingsClient(
        supabase,
        {
          userId: user.id,
          companyName,
          contactName,
          defaultLaborPercentage: laborPercentage,
          defaultSpreadRate: spreadRate,
          doorTrimPricing,
          baseboardPricing,
          defaultRates,
          defaultPaintCosts
        }
      )
      
      // Add paint products if any
      if (paintProducts.length > 0) {
        for (const product of paintProducts) {
          await addPaintProductClient(
            supabase,
            {
              userId: user.id,
              productName: product.productName,
              useCase: product.useCase,
              costPerGallon: product.costPerGallon,
              sheen: product.sheen
            }
          )
        }
      }

      toast({
        title: 'Welcome aboard!',
        description: 'Your account has been set up successfully.'
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error during setup:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete setup. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome! Let&apos;s set up your account</CardTitle>
          <CardDescription>
            Step {step} of 5: {
              step === 1 ? 'Basic Company Information' :
              step === 2 ? 'Default Settings' :
              step === 3 ? 'Surface Rates' :
              step === 4 ? 'Paint Costs' :
              'Paint Products (Optional)'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name*</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Professional Painting Co."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Name</Label>
                <Input
                  id="contact"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="laborPercentage">Default Labor Percentage (%)</Label>
                <Input
                  id="laborPercentage"
                  type="number"
                  value={laborPercentage}
                  onChange={(e) => setLaborPercentage(Number(e.target.value))}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground">
                  This is the percentage of the total quote that goes to labor
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="spreadRate">Default Paint Spread Rate (sqft/gallon)</Label>
                <Input
                  id="spreadRate"
                  type="number"
                  value={spreadRate}
                  onChange={(e) => setSpreadRate(Number(e.target.value))}
                  placeholder="350"
                />
                <p className="text-xs text-muted-foreground">
                  How many square feet one gallon of paint covers
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doorPrice">Door Unit Price ($)</Label>
                <Input
                  id="doorPrice"
                  type="number"
                  value={doorUnitPrice}
                  onChange={(e) => setDoorUnitPrice(Number(e.target.value))}
                  placeholder="45"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trimPrice">Trim Price ($ per linear foot)</Label>
                <Input
                  id="trimPrice"
                  type="number"
                  value={trimLinearFootPrice}
                  onChange={(e) => setTrimLinearFootPrice(Number(e.target.value))}
                  placeholder="3"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Baseboard Charging Method</Label>
                <div className="flex space-x-4 mt-2">
                  <Button
                    type="button"
                    variant={baseboardMethod === 'linear_foot' ? 'default' : 'outline'}
                    onClick={() => setBaseboardMethod('linear_foot')}
                  >
                    By Linear Foot
                  </Button>
                  <Button
                    type="button"
                    variant={baseboardMethod === 'included' ? 'default' : 'outline'}
                    onClick={() => setBaseboardMethod('included')}
                  >
                    Included with Walls
                  </Button>
                </div>
              </div>
              
              {baseboardMethod === 'linear_foot' && (
                <div className="space-y-2">
                  <Label htmlFor="baseboardPrice">Baseboard Price ($ per linear foot)</Label>
                  <Input
                    id="baseboardPrice"
                    type="number"
                    value={baseboardPrice}
                    onChange={(e) => setBaseboardPrice(Number(e.target.value))}
                    placeholder="2.5"
                  />
                </div>
              )}
            </>
          )}
          
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="wallsRate">Walls Rate ($ per sqft)</Label>
                <Input
                  id="wallsRate"
                  type="number"
                  step="0.01"
                  value={wallsRate}
                  onChange={(e) => setWallsRate(Number(e.target.value))}
                  placeholder="3.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ceilingsRate">Ceilings Rate ($ per sqft)</Label>
                <Input
                  id="ceilingsRate"
                  type="number"
                  step="0.01"
                  value={ceilingsRate}
                  onChange={(e) => setCeilingsRate(Number(e.target.value))}
                  placeholder="2.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trimDoorsRate">Trim & Doors Rate ($ per sqft)</Label>
                <Input
                  id="trimDoorsRate"
                  type="number"
                  step="0.01"
                  value={trimDoorsRate}
                  onChange={(e) => setTrimDoorsRate(Number(e.target.value))}
                  placeholder="5.00"
                />
              </div>
            </>
          )}
          
          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="wallsPaintCost">Walls Paint Cost ($ per gallon)</Label>
                <Input
                  id="wallsPaintCost"
                  type="number"
                  value={wallsPaintCost}
                  onChange={(e) => setWallsPaintCost(Number(e.target.value))}
                  placeholder="26"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ceilingsPaintCost">Ceilings Paint Cost ($ per gallon)</Label>
                <Input
                  id="ceilingsPaintCost"
                  type="number"
                  value={ceilingsPaintCost}
                  onChange={(e) => setCeilingsPaintCost(Number(e.target.value))}
                  placeholder="25"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trimDoorsPaintCost">Trim & Doors Paint Cost ($ per gallon)</Label>
                <Input
                  id="trimDoorsPaintCost"
                  type="number"
                  value={trimDoorsPaintCost}
                  onChange={(e) => setTrimDoorsPaintCost(Number(e.target.value))}
                  placeholder="35"
                />
              </div>
            </>
          )}
          
          {step === 5 && (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Paint Products</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAddingProducts(!addingProducts)}
                  >
                    {addingProducts ? 'Cancel' : 'Add Product'}
                  </Button>
                </div>
                
                {addingProducts && (
                  <div className="border p-4 rounded-md space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        value={currentProduct.productName}
                        onChange={(e) => setCurrentProduct({...currentProduct, productName: e.target.value})}
                        placeholder="SuperPaint"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="useCase">Use Case</Label>
                      <select 
                        id="useCase"
                        className="w-full p-2 border rounded-md"
                        value={currentProduct.useCase}
                        onChange={(e) => setCurrentProduct({
                          ...currentProduct, 
                          useCase: e.target.value as 'walls' | 'ceilings' | 'trim' | 'doors'
                        })}
                      >
                        <option value="walls">Walls</option>
                        <option value="ceilings">Ceilings</option>
                        <option value="trim">Trim</option>
                        <option value="doors">Doors</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="costPerGallon">Cost Per Gallon ($)</Label>
                      <Input
                        id="costPerGallon"
                        type="number"
                        value={currentProduct.costPerGallon || ''}
                        onChange={(e) => setCurrentProduct({
                          ...currentProduct, 
                          costPerGallon: Number(e.target.value)
                        })}
                        placeholder="35"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sheen">Sheen (optional)</Label>
                      <Input
                        id="sheen"
                        value={currentProduct.sheen}
                        onChange={(e) => setCurrentProduct({...currentProduct, sheen: e.target.value})}
                        placeholder="Satin"
                      />
                    </div>
                    
                    <Button onClick={addProduct} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Inventory
                    </Button>
                  </div>
                )}
                
                {paintProducts.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Your Products:</Label>
                    {paintProducts.map((product, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.useCase} | ${product.costPerGallon}/gallon
                            {product.sheen && ` | ${product.sheen}`}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeProduct(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-muted-foreground">
                      No products added yet. This step is optional - you can add products later.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} disabled={isLoading}>
              Back
            </Button>
          ) : (
            <div></div> // Empty div to maintain spacing
          )}
          
          {step < 5 ? (
            <Button onClick={nextStep} disabled={isLoading || (step === 1 && !companyName.trim())}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={isLoading || !companyName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
        <div className="px-6 pb-4">
          <p className="text-xs text-center text-muted-foreground">
            You can update these details and configure costs in Settings at any time
          </p>
        </div>
      </Card>
    </div>
  )
}
