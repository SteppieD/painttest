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

    // First, test basic connectivity
    console.log('🌐 Testing connectivity...')
    try {
      const connectivityTest = await fetch('/api/health/access-code')
      console.log('🌐 Connectivity test status:', connectivityTest.status)
      const healthData = await connectivityTest.json()
      console.log('🌐 Health check data:', healthData)
    } catch (connectivityError) {
      console.error('🌐 Connectivity test failed:', connectivityError)
    }

    // Retry logic for server-side issues
    const maxRetries = 3
    let attempt = 0
    let data: any

    while (attempt < maxRetries) {
      try {
        attempt++
        console.log(`📡 Attempt ${attempt}/${maxRetries}: Making API request to /api/auth/access-code`)
        
        const response = await fetch(`/api/auth/access-code?_=${Date.now()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
        })

        console.log(`📡 Attempt ${attempt}: API response status:`, response.status)
        console.log(`📡 Attempt ${attempt}: API response headers:`, Object.fromEntries(response.headers.entries()))
        console.log(`📡 Attempt ${attempt}: API response ok:`, response.ok)
        
        // Get response text first to debug parsing issues
        const responseText = await response.text()
        console.log(`📡 Attempt ${attempt}: Raw response text:`, responseText)
        
        try {
          data = JSON.parse(responseText)
          console.log(`📡 Attempt ${attempt}: Parsed JSON data:`, data)
        } catch (parseError) {
          console.error(`📡 Attempt ${attempt}: JSON parse error:`, parseError)
          console.log(`📡 Attempt ${attempt}: Response was not valid JSON, content:`, responseText)
          throw new Error(`Invalid JSON response: ${responseText}`)
        }

        if (!response.ok) {
          // If it's a 401 and we have retries left, wait and try again
          if (response.status === 401 && attempt < maxRetries) {
            console.log(`⏳ Attempt ${attempt} failed with 401, retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
          throw new Error(data.error || 'Invalid access code')
        }

        // Success! Break out of retry loop
        console.log(`✅ Success on attempt ${attempt}`)
        break
      } catch (error: any) {
        console.log(`❌ Attempt ${attempt} failed:`, error.message)
        
        // If this was the last attempt, throw the error
        if (attempt >= maxRetries) {
          throw error
        }
        
        // Wait before retrying (exponential backoff)
        console.log(`⏳ Waiting ${attempt * 1000}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }

    try {
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