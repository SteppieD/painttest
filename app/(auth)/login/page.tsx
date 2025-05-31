'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to access code page since Google Auth is disabled
    router.push('/access-code')
  }, [router])

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to access code login...</p>
      </div>
    </div>
  )
}
