'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccessCodePage() {
  const router = useRouter()
  const [accessCode, setAccessCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/success')
      } else {
        setError(data.error || 'Invalid access code')
      }
    } catch (error) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>🎨 Painting Quote App</h1>
          <p style={{ color: '#666', margin: 0 }}>Enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="DEMO2024"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                textAlign: 'center',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div style={{
              color: '#e74c3c',
              backgroundColor: '#fdf2f2',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#bdc3c7' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
            disabled={isLoading || !accessCode.trim()}
          >
            {isLoading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '12px', color: '#999' }}>
            Demo code: DEMO2024
          </p>
        </div>
      </div>
    </div>
  )
}