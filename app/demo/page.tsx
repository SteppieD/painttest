'use client'

import { QuotePreview, QuoteData } from '@/components/quote-preview'

export default function DemoPage() {
  // Sample quote data for demonstration
  const sampleQuoteData: QuoteData = {
    user: {
      name: "John Smith",
      company: "Professional Painters Co."
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">PaintQuote Pro Demo</h1>
        <p className="text-center mb-8 text-gray-500">This is a demonstration of the quote generation feature.</p>
        <div className="bg-white rounded-lg shadow">
          <QuotePreview quoteData={sampleQuoteData} />
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Try the &quot;Copy Quote to Clipboard&quot; button to see how easy it is to share your quote!
          </p>
        </div>
      </div>
    </div>
  )
}
