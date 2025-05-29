'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'

export default function SetupPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')

  const handleComplete = async () => {
    if (!companyName.trim()) {
      toast({
        title: 'Company name required',
        description: 'Please enter your company name to continue.',
        variant: 'destructive'
      })
      return
    }

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

      // Create default cost settings
      const { error: costError } = await supabase
        .from('cost_settings')
        .insert({
          user_id: user.id,
          labor_cost_per_hour: 25,
          paint_costs: {
            good: 25,
            better: 35,
            best: 50
          },
          supplies_base_cost: 100
        })

      if (costError && costError.code !== '23505') { // Ignore duplicate key error
        throw costError
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
            Just a few quick details to get you started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleComplete}
              disabled={isLoading || !companyName.trim()}
              className="w-full"
              size="lg"
            >
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            You can update these details and configure costs in Settings later
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
