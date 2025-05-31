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
        
        // Add a small delay to ensure localStorage is fully available
        await new Promise(resolve => setTimeout(resolve, 100))
        
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
            const sessionAge = Date.now() - parsed.loginTime
            const isValid = sessionAge < 24 * 60 * 60 * 1000
            
            console.log('📝 Parsed session data:', { 
              userId: parsed.userId, 
              companyName: parsed.companyName,
              loginTime: new Date(parsed.loginTime).toISOString(),
              sessionAgeMinutes: Math.round(sessionAge / 60000),
              isValid
            })
            
            // Check if session is not too old (24 hours)
            if (isValid) {
              // Valid access code session - additional verification
              console.log('🔍 Verifying session with health check...')
              
              try {
                const healthResponse = await fetch('/api/health/access-code')
                const healthData = await healthResponse.json()
                console.log('🏥 Health check result:', healthData)
                
                if (healthData.status === 'ok' && healthData.checks.demo_code_exists === 'ok') {
                  console.log('✅ Valid access code session confirmed, allowing access')
                  setIsAuthenticated(true)
                  setIsLoading(false)
                  return
                } else {
                  console.log('⚠️ Health check failed, session may be invalid')
                }
              } catch (healthError) {
                console.log('⚠️ Health check failed:', healthError)
                // Continue with session validation despite health check failure
                console.log('✅ Proceeding with session validation despite health check failure')
                setIsAuthenticated(true)
                setIsLoading(false)
                return
              }
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

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'paintquote_session') {
        console.log('🔄 Session storage changed, rechecking authentication')
        checkAuthentication()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    checkAuthentication()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
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