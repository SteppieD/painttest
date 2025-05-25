'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'
import type { PaintCosts } from '@/types/database'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Company Info
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  
  // Cost Settings
  const [laborCost, setLaborCost] = useState('25')
  const [paintCosts, setPaintCosts] = useState<PaintCosts>({
    good: 25,
    better: 35,
    best: 50
  })
  const [suppliesBaseCost, setSuppliesBaseCost] = useState('100')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setCompanyName(profile.company_name || '')
      setPhone(profile.phone || '')
    }

    // Load cost settings
    const { data: costSettings } = await supabase
      .from('cost_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (costSettings) {
      setLaborCost(costSettings.labor_cost_per_hour.toString())
      setPaintCosts(costSettings.paint_costs as PaintCosts)
      setSuppliesBaseCost(costSettings.supplies_base_cost.toString())
    }
  }

  const handleSave = async () => {
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

      // Update or insert cost settings
      const { error: costError } = await supabase
        .from('cost_settings')
        .upsert({
          user_id: user.id,
          labor_cost_per_hour: parseFloat(laborCost),
          paint_costs: paintCosts,
          supplies_base_cost: parseFloat(suppliesBaseCost),
          updated_at: new Date().toISOString()
        })

      if (costError) throw costError

      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your business information and cost settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            This information will appear on your quotes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Professional Painting Co."
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
          </div>
        </CardContent>
      </Card>

      {/* Cost Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Settings</CardTitle>
          <CardDescription>
            Configure your base costs for labor, paint, and supplies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Labor Cost */}
          <div className="space-y-2">
            <Label htmlFor="labor-cost">Labor Cost per Hour</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="labor-cost"
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="25"
                className="max-w-xs"
              />
              <span className="text-muted-foreground">per hour</span>
            </div>
            <p className="text-sm text-muted-foreground">
              What you pay your workers per hour
            </p>
          </div>

          {/* Paint Costs */}
          <div className="space-y-4">
            <div>
              <Label>Paint Costs per Gallon</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Set your costs for different paint quality levels
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="paint-good">Good (Economy)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="paint-good"
                    type="number"
                    value={paintCosts.good}
                    onChange={(e) => setPaintCosts({
                      ...paintCosts,
                      good: parseFloat(e.target.value) || 0
                    })}
                    placeholder="25"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paint-better">Better (Standard)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="paint-better"
                    type="number"
                    value={paintCosts.better}
                    onChange={(e) => setPaintCosts({
                      ...paintCosts,
                      better: parseFloat(e.target.value) || 0
                    })}
                    placeholder="35"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paint-best">Best (Premium)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="paint-best"
                    type="number"
                    value={paintCosts.best}
                    onChange={(e) => setPaintCosts({
                      ...paintCosts,
                      best: parseFloat(e.target.value) || 0
                    })}
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Supplies Cost */}
          <div className="space-y-2">
            <Label htmlFor="supplies-cost">Base Supplies Cost</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="supplies-cost"
                type="number"
                value={suppliesBaseCost}
                onChange={(e) => setSuppliesBaseCost(e.target.value)}
                placeholder="100"
                className="max-w-xs"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Base cost for supplies (tape, brushes, drop cloths, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Markup Guidance */}
      <Card>
        <CardHeader>
          <CardTitle>Markup Guidelines</CardTitle>
          <CardDescription>
            Suggested markup percentages for different job types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Budget-friendly jobs</span>
              <span className="font-medium">10-15%</span>
            </div>
            <div className="flex justify-between">
              <span>Standard residential</span>
              <span className="font-medium">15-20%</span>
            </div>
            <div className="flex justify-between">
              <span>Quality focused</span>
              <span className="font-medium">20-25%</span>
            </div>
            <div className="flex justify-between">
              <span>Premium/Complex</span>
              <span className="font-medium">25-30%</span>
            </div>
            <div className="flex justify-between">
              <span>Rush jobs</span>
              <span className="font-medium">30%+</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Remember: You can adjust markup on a per-quote basis in the chat interface
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
