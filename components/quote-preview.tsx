"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export interface QuoteData {
  user: {
    name: string
    company: string
  }
  client: {
    name: string
    address: string
  }
  lineItems: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax: number
  total: number
}

// Sample data for when no quote data is provided
const sampleQuote: QuoteData = {
  user: {
    name: "John Doe",
    company: "Professional Painters Inc."
  },
  client: {
    name: "Alice Smith",
    address: "123 Main St, Anytown, USA"
  },
  lineItems: [
    {
      description: "Interior Wall Painting - Living Room",
      quantity: 400,
      unitPrice: 3,
      total: 1200
    },
    {
      description: "Ceiling Painting - Living Room",
      quantity: 200,
      unitPrice: 4,
      total: 800
    },
    {
      description: "Trim and Baseboards",
      quantity: 1,
      unitPrice: 300,
      total: 300
    }
  ],
  subtotal: 2300,
  tax: 0,
  total: 2300
}

interface QuotePreviewProps {
  quoteData?: QuoteData
}

export function QuotePreview({ quoteData }: QuotePreviewProps) {
  const [quote] = useState<QuoteData>(quoteData || sampleQuote)

  const formatQuoteText = () => {
    const lines = [
      'PAINTING QUOTE',
      '==============\n',
      'From:',
      quote.user.company,
      quote.user.name + '\n',
      'To:',
      quote.client.name,
      quote.client.address + '\n',
      'Items:',
      '----------------------------------------',
      'Description                  Qty    Price',
      '----------------------------------------'
    ]

    // Add line items
    quote.lineItems.forEach(item => {
      const description = item.description.padEnd(30)
      const quantity = item.quantity.toString().padStart(4)
      const total = formatCurrency(item.total).padStart(10)
      lines.push(`${description}${quantity}${total}`)
    })

    // Add totals
    lines.push(
      '\n----------------------------------------',
      `Subtotal:${formatCurrency(quote.subtotal).padStart(32)}`,
      `Tax:${formatCurrency(quote.tax).padStart(36)}`,
      `Total:${formatCurrency(quote.total).padStart(34)}`,
      '----------------------------------------'
    )

    return lines.join('\n')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatQuoteText())
      toast({
        title: "Quote copied",
        description: "The quote has been copied to your clipboard"
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold mb-4">Painting Quote</h1>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold mb-2">From:</h2>
            <p>{quote.user.company}</p>
            <p>{quote.user.name}</p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">To:</h2>
            <p>{quote.client.name}</p>
            <p className="whitespace-pre-wrap">{quote.client.address}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <h2 className="font-semibold">Items:</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right py-2">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(quote.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{formatCurrency(quote.tax)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(quote.total)}</span>
        </div>
      </div>

      {/* Copy Button */}
      <div className="pt-4">
        <Button 
          onClick={copyToClipboard}
          className="w-full sm:w-auto"
        >
          Copy Quote to Clipboard
        </Button>
      </div>
    </div>
  )
}
