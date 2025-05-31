'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'

interface SessionData {
  userId: string
  sessionToken: string
  companyName: string
  loginTime: number
}

export function DashboardAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🔐 DashboardAuthWrapper: Checking authentication...')
        
        // First, check for Supabase authentication
        const { data: { user } } = await supabase.auth.getUser()
        console.log('👤 Supabase user:', !!user)
        
        if (user) {
          // User is authenticated with Supabase
          console.log('✅ Supabase auth found, allowing access')
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }

        // If no Supabase user, check for access code session
        const sessionData = localStorage.getItem('paintquote_session')
        console.log('💾 localStorage session exists:', !!sessionData)
        
        if (sessionData) {
          try {
            const parsed: SessionData = JSON.parse(sessionData)
            console.log('📝 Parsed session data:', { 
              userId: parsed.userId, 
              companyName: parsed.companyName,
              loginTime: new Date(parsed.loginTime).toISOString(),
              isValid: Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000
            })
            
            // Check if session is not too old (24 hours)
            if (Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000) {
              // Valid access code session
              console.log('✅ Valid access code session found, allowing access')
              setIsAuthenticated(true)
              setIsLoading(false)
              return
            } else {
              // Session expired
              console.log('⏰ Session expired, removing and redirecting')
              localStorage.removeItem('paintquote_session')
            }
          } catch (parseError) {
            // Invalid session data
            console.log('❌ Invalid session data, removing and redirecting', parseError)
            localStorage.removeItem('paintquote_session')
          }
        } else {
          console.log('❌ No session data found')
        }

        // No valid authentication found
        console.log('🚫 No valid authentication, redirecting to access-code')
        router.push('/access-code')
      } catch (error) {
        console.error('❌ Authentication check failed:', error)
        router.push('/access-code')
      }
    }

    checkAuthentication()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return <>{children}</>
}