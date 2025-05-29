'use client'

// Email/password login page - updated
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/quotes/dashboard',
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
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
          <h2 className="text-xl font-semibold text-center mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/quotes/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
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
            <p className="text-sm text-muted-foreground">Instant Quotes</p>
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
