'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuotePreview, QuoteData } from '@/components/quote-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, LogOut } from 'lucide-react'

interface SessionData {
  userId: string
  sessionToken: string
  companyName: string
  loginTime: number
}

export default function DemoPage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for valid session
    const sessionData = localStorage.getItem('paintquote_session')
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData)
        // Check if session is not too old (24 hours)
        if (Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000) {
          setSession(parsed)
        } else {
          localStorage.removeItem('paintquote_session')
          router.push('/access-code')
        }
      } catch {
        localStorage.removeItem('paintquote_session')
        router.push('/access-code')
      }
    } else {
      router.push('/access-code')
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('paintquote_session')
    router.push('/access-code')
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null // Will redirect
  }
  // Sample quote data for demonstration
  const sampleQuoteData: QuoteData = {
    user: {
      name: "Demo User",
      company: session.companyName
    },
    client: {
      name: "Sarah Johnson",
      address: "123 Main Street, Anytown, USA"
    },
    lineItems: [
      {
        description: "Interior Wall Painting - Living Room",
        quantity: 450,
        unitPrice: 3.50,
        total: 1575
      },
      {
        description: "Interior Wall Painting - Bedrooms (2)",
        quantity: 600,
        unitPrice: 3.50,
        total: 2100
      },
      {
        description: "Ceiling Painting",
        quantity: 800,
        unitPrice: 2.75,
        total: 2200
      },
      {
        description: "Trim and Baseboards",
        quantity: 1,
        unitPrice: 850,
        total: 850
      },
      {
        description: "Premium Paint Supplies",
        quantity: 1,
        unitPrice: 750,
        total: 750
      }
    ],
    subtotal: 7475,
    tax: 0,
    total: 7475
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">PaintQuote Pro Demo</h1>
            <p className="text-sm text-gray-600">Welcome, {session.companyName}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Quote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Start a new painting quote with our AI assistant.</p>
              <Button onClick={() => router.push('/demo-chat')} className="w-full">
                Start New Quote
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Sample Quote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View a sample quote to see the final output.</p>
              <Button onClick={() => router.push('/test-quote')} variant="outline" className="w-full">
                View Sample
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sample Quote Preview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Sample Quote Preview</h2>
            <p className="text-gray-600">This shows how your quotes will look to clients.</p>
          </div>
          <QuotePreview quoteData={sampleQuoteData} />
        </div>
      </div>
    </div>
  )
}
