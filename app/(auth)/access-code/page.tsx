'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'

export default function AccessCodePage() {
  const router = useRouter()
  const supabase = useSupabase()
  const { toast } = useToast()
  const [accessCode, setAccessCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) return

    console.log('🎯 Form submitted with access code:', accessCode.trim().toUpperCase())
    setIsLoading(true)

    try {
      console.log('📡 Making API request to /api/auth/access-code')
      const response = await fetch('/api/auth/access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
      })

      console.log('📡 API response status:', response.status)
      const data = await response.json()
      console.log('📡 API response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Invalid access code')
      }

      // Success! Store session data in localStorage
      const sessionData = {
        userId: data.userId,
        sessionToken: data.sessionToken,
        companyName: data.companyName,
        loginTime: Date.now()
      }
      
      console.log('🔑 Access code success, storing session:', sessionData)
      localStorage.setItem('paintquote_session', JSON.stringify(sessionData))
      
      // Verify storage worked
      const stored = localStorage.getItem('paintquote_session')
      console.log('💾 Session stored successfully:', !!stored)
      
      // IMMEDIATE redirect without waiting for toast
      console.log('🚀 Immediate redirect to dashboard...')
      try {
        window.location.href = '/dashboard'
      } catch (redirectError) {
        console.error('❌ Redirect failed:', redirectError)
        // Try alternative redirect
        window.location.replace('/dashboard')
      }
    } catch (error: any) {
      console.error('Access code login error:', error)
      toast({
        title: 'Invalid Access Code',
        description: error.message || 'Please check your access code and try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Enter Access Code</CardTitle>
          <CardDescription>
            Enter your demo access code to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="DEMO-2024"
                className="text-center text-lg font-mono tracking-wider"
                required
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !accessCode.trim()}
            >
              {isLoading ? 'Verifying...' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need an access code? Contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}