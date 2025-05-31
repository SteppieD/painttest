'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/access-code')
  }, [router])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Painting Quote App</h1>
      <p>Redirecting to access code...</p>
      <a href="/access-code">Click here if not redirected</a>
    </div>
  )
}