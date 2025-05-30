'use client'

import { Button } from '@/components/ui/button'
import { useSupabase } from '@/app/providers'
import { FcGoogle } from 'react-icons/fc'
import { Paintbrush, Key } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = useSupabase()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      console.error('Error during login:', error)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-subtle">
            <Paintbrush className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">PaintQuote Pro</h1>
          <p className="text-muted-foreground">Create professional painting quotes with AI</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl shadow-subtle border p-8">
          <h2 className="text-xl font-semibold text-center mb-6">Welcome back</h2>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-medium"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full h-12 text-base font-medium mt-4"
            onClick={() => router.push('/access-code')}
          >
            <Key className="mr-3 h-5 w-5" />
            Enter Access Code
          </Button>

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
            <div className="text-2xl mb-2 transform transition-transform group-hover:scale-110">💬</div>
            <p className="text-sm text-muted-foreground">AI Chat</p>
          </div>
          <div className="group cursor-default">
            <div className="text-2xl mb-2 transform transition-transform group-hover:scale-110">📊</div>
            <p className="text-sm text-muted-foreground">Smart Pricing</p>
          </div>
          <div className="group cursor-default">
            <div className="text-2xl mb-2 transform transition-transform group-hover:scale-110">📄</div>
            <p className="text-sm text-muted-foreground">PDF Export</p>
          </div>
        </div>
      </div>
    </div>
  )
}
