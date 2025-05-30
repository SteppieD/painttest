'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { AlertCircle, Key } from 'lucide-react'

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (accessCode.length !== 6) {
      setError('Access code must be 6 digits')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid access code')
        return
      }

      // Success - redirect to dashboard
      router.push('/quotes/dashboard')
      router.refresh()
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateCode = async () => {
    try {
      const response = await fetch('/api/auth/generate-code', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok) {
        setAccessCode(data.accessCode)
      }
    } catch (error) {
      console.error('Failed to generate code:', error)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-subtle">
            <svg className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
              <path d="M12 13a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">PaintQuote Pro</h1>
          <p className="text-muted-foreground">Professional painting quotes made simple</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl shadow-subtle border p-8">
          <div className="text-center mb-6">
            <Key className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-semibold">Enter Access Code</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your 6-digit company access code
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="mt-1 text-center text-2xl font-mono tracking-widest"
                placeholder="123456"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading || accessCode.length !== 6}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Don&apos;t have an access code?
            </p>
            <Button
              variant="outline"
              onClick={generateCode}
              className="w-full"
            >
              Generate New Access Code
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="group cursor-default">
            <div className="text-2xl mb-2 transform transition-transform group-hover:scale-110">🎨</div>
            <p className="text-sm text-muted-foreground">Paint Quotes</p>
          </div>
          <div className="group cursor-default">
            <div className="text-2xl mb-2 transform transition-transform group-hover:scale-110">🏠</div>
            <p className="text-sm text-muted-foreground">Residential</p>
          </div>
          <div className="group cursor-default">
            <div className="text-2xl mb-2 transform transition-transform group-hover:scale-110">⚡</div>
            <p className="text-sm text-muted-foreground">Instant Access</p>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
          <p className="text-sm font-medium mb-2">Ready to transform your space?</p>
          <p className="text-sm text-muted-foreground">Professional painting quotes in minutes</p>
        </div>
      </div>
    </div>
  )
}