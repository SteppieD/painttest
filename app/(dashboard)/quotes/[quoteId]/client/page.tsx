'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

export default function ClientQuotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [quote, setQuote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    // For now, show a placeholder
    setIsLoading(false)
    setQuote({
      id: params.quoteId,
      status: 'sent',
      total: 5000,
      createdAt: new Date().toISOString(),
      project: {
        clientName: 'Sample Client',
        propertyAddress: '123 Main St'
      }
    })
  }, [params.quoteId])

  const handleAcceptQuote = async () => {
    setIsAccepting(true)
    
    try {
      const response = await fetch(`/api/quotes/${params.quoteId}/accept`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to accept quote')
      
      setQuote({ ...quote, status: 'accepted' })
      toast({
        title: "Quote Accepted!",
        description: "Thank you for accepting this quote. We'll be in touch soon.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Quote not found</p>
            <Button asChild className="mt-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAccepted = quote.status === 'accepted'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Painting Quote</h1>
              <p className="text-muted-foreground">
                {quote.project.clientName} • {quote.project.propertyAddress}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-lg font-medium">Total Quote Amount</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(quote.total)}
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                Quote created on {formatDate(quote.createdAt)}
              </div>

              {isAccepted ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Quote Accepted</span>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button
                    onClick={handleAcceptQuote}
                    disabled={isAccepting}
                    size="lg"
                    className="flex-1"
                  >
                    {isAccepting ? 'Accepting...' : 'Accept Quote'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                  >
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}