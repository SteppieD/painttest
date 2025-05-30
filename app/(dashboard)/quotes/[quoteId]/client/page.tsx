'use client'

import { useEffect, useState } from 'react'
// Removed broken import
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { formatQuoteForCopy } from '@/lib/quote-formatter'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Copy, Printer, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

// Helper functions to calculate totals and format data
const calculateTotalSqft = (details: any) => {
  if (details.items) {
    return details.items.reduce((sum: number, item: any) => sum + (item.sqft || 0), 0)
  }
  if (details.rooms) {
    return details.rooms.reduce((sum: number, room: any) => sum + (room.sqft || 0), 0)
  }
  return 0
}

const calculateTotalTrim = (details: any) => {
  if (details.totalTrim) return details.totalTrim
  if (details.items) {
    return details.items.reduce((sum: number, item: any) => {
      if (item.trimIncluded && item.sqft) {
        // Estimate trim based on room size (rough calculation)
        return sum + Math.ceil(Math.sqrt(item.sqft) * 4 * 0.8) // 80% of perimeter
      }
      return sum
    }, 0)
  }
  return 0
}

const calculateTotalDoors = (details: any) => {
  if (details.doors) return details.doors
  if (details.items) {
    return details.items.reduce((sum: number, item: any) => sum + (item.doorsCount || 1), 0)
  }
  if (details.rooms) {
    return details.rooms.reduce((sum: number, room: any) => sum + (room.doorsCount || 1), 0)
  }
  return 0
}

const getQuoteItems = (details: any) => {
  if (details.items) {
    return details.items.map((item: any) => ({
      name: item.name,
      sqft: item.sqft || 0,
      description: item.description || `${item.name} patched, prepped, and painted`,
      coats: item.coats || details.coats || 2,
      paintType: item.paintType || getPaintTypeForItem(item.name)
    }))
  }
  
  if (details.rooms) {
    return details.rooms.map((room: any) => ({
      name: room.name,
      sqft: room.sqft || 0,
      description: `${room.name} patched, prepped, and painted`,
      coats: details.coats || 2,
      paintType: getPaintTypeForItem(room.name)
    }))
  }
  
  return []
}

const getPaintTypeForItem = (itemName: string) => {
  const name = itemName.toLowerCase()
  if (name.includes('trim') || name.includes('door') || name.includes('cabinet')) {
    return 'Semi-Gloss Enamel'
  }
  if (name.includes('ceiling')) {
    return 'Flat Ceiling Paint'
  }
  return 'Premium Interior Eggshell'
}

export default function ClientQuotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [quote, setQuote] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    fetchQuoteData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.quoteId])

  const fetchQuoteData = async () => {
    const supabase = createClient()
    
    // Fetch quote with project info
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        project:projects(
          client_name,
          property_address,
          user_id
        )
      `)
      .eq('id', params.quoteId)
      .single()

    if (quoteError || !quoteData) {
      router.push('/quotes')
      return
    }

    // Fetch company profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('company_name, phone')
      .eq('id', quoteData.project.user_id)
      .single()

    setQuote(quoteData)
    setProfile(profileData)
    setLoading(false)
  }

  const handleCopyQuote = () => {
    const quoteText = formatQuoteForCopy({ 
      quote, 
      project: quote.project, 
      profile 
    })
    navigator.clipboard.writeText(quoteText)
    toast({
      title: "Quote copied!",
      description: "The quote has been copied to your clipboard.",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleAcceptQuote = async () => {
    setAccepting(true)
    try {
      const response = await fetch(`/api/quotes/${params.quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setQuote({ ...quote, status: 'accepted', accepted_at: new Date().toISOString() })
        toast({
          title: "Quote Accepted!",
          description: "Thank you! We'll be in touch soon to schedule your project.",
        })
      } else {
        throw new Error(data.error || 'Failed to accept quote')
      }
    } catch (error) {
      console.error('Error accepting quote:', error)
      toast({
        title: "Error",
        description: "Failed to accept quote. Please try again or contact us directly.",
        variant: "destructive"
      })
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const details = quote.details as any
  const isExpired = new Date(quote.valid_until) < new Date()

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Navigation - hidden in print */}
      <div className="print:hidden p-4 border-b">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/quotes/${quote.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyQuote}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Quote
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Quote Content */}
      <div className="container max-w-4xl mx-auto p-6 print:p-0">
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8 print:p-0">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{profile?.company_name || 'Professional Painting Co.'}</h1>
                  <p className="text-sm text-muted-foreground">
                    {profile?.phone || '(555) 123-4567'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || 'info@propainting.com'}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold mb-1">Painting Quote</h2>
                  <p className="text-sm text-muted-foreground">Quote #{quote.quote_number || quote.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground mt-2">Issue Date: {formatDate(quote.created_at)}</p>
                  <p className="text-sm text-muted-foreground">Valid Until: {formatDate(quote.valid_until)}</p>
                </div>
              </div>
            </div>

            {/* Quote Status */}
            {isExpired ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 print:hidden">
                <p className="font-medium">This quote has expired</p>
                <p className="text-sm">Please contact us for an updated quote.</p>
              </div>
            ) : (
              <div className="bg-success/10 text-success p-4 rounded-lg mb-6 print:bg-transparent print:text-foreground">
                <p className="font-medium">Quote valid until {formatDate(quote.valid_until)}</p>
              </div>
            )}

            {/* Client Information */}
            <div className="mb-8 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Prepared For:</p>
                <p className="font-semibold">{quote.project.client_name}</p>
                <p className="text-sm mt-2"><span className="font-semibold">Property Address:</span></p>
                <p className="text-sm">{quote.project.property_address}</p>
              </div>
            </div>

            {/* Project Scope */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-primary">Project Scope</h3>
              
              {/* Project Summary */}
              <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold mb-3">Project Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Paint Area: <span className="font-semibold">{quote.total_sqft || details.totalSqft || calculateTotalSqft(details)} sq ft</span></div>
                  <div>Total Trim: <span className="font-semibold">{details.totalTrim || calculateTotalTrim(details)} linear ft</span></div>
                  <div>Doors: <span className="font-semibold">{details.doors || calculateTotalDoors(details)}</span></div>
                </div>
              </div>

              {/* Surface Breakdown Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-2 text-sm font-semibold">Item</th>
                      <th className="text-left py-2 text-sm font-semibold">Description</th>
                      <th className="text-center py-2 text-sm font-semibold">Coats</th>
                      <th className="text-left py-2 text-sm font-semibold">Paint Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getQuoteItems(details).map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm">{item.name} ({item.sqft} sqft)</td>
                        <td className="py-2 text-sm">{item.description}</td>
                        <td className="py-2 text-sm text-center">{item.coats}</td>
                        <td className="py-2 text-sm">{item.paintType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Surface Preparation */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Surface Preparation Included:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Light patching and sanding of wall surfaces
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Caulking gaps around trim and filling nail holes
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Surface cleaning and spot priming where needed
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Complete protection of floors, furniture and fixtures
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Thorough cleanup and debris removal upon completion
                  </li>
                </ul>
              </div>

              {/* Paint Specifications */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Paint Specifications:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Premium quality interior paints for durability and washability
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Industry standard application techniques for smooth, even finish
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Professional equipment and tools for superior results
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Colors to be selected by client (samples available upon request)
                  </li>
                </ul>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-8 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="text-center">
                <p className="text-lg mb-2">Total Price:</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(quote.final_price)}</p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3 text-primary">Terms & Conditions</h3>
              <ol className="space-y-1 text-sm list-decimal list-inside">
                <li>30-day quote validity</li>
                <li>50% deposit required</li>
                <li>Balance due upon completion</li>
              </ol>
              <p className="text-sm mt-4 italic">
                By accepting this quote, you agree to the terms and conditions outlined above.
              </p>
            </div>

            {/* Call to Action - hidden in print */}
            <div className="text-center print:hidden mb-8">
              {quote.status === 'accepted' ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Quote Accepted!</span>
                </div>
              ) : isExpired ? (
                <p className="text-muted-foreground">This quote has expired. Please contact us for an updated quote.</p>
              ) : (
                <Button 
                  size="lg" 
                  className="px-8"
                  onClick={handleAcceptQuote}
                  disabled={accepting}
                >
                  {accepting ? "Accepting..." : "Accept Quote"}
                </Button>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Thank you for choosing {profile?.company_name || 'Professional Painting Co.'}. We look forward to working with you!
              </p>
            </div>

            {/* Footer - visible in print */}
            <div className="hidden print:block mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>Thank you for considering us for your painting project!</p>
              <p className="mt-2">{profile?.company_name} • {profile?.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}