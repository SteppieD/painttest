'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateQuotePDF } from '@/lib/pdf-generator'
import { useToast } from '@/components/ui/use-toast'
import type { ProjectDetails, BaseCosts } from '@/types/database'

export default function TestQuotePage() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateTest = async () => {
    setIsGenerating(true)
    try {
      // Sample data for testing
      const sampleData: {
        clientName: string
        propertyAddress: string
        projectDetails: ProjectDetails
        baseCosts: BaseCosts
        markupPercentage: number
        companyName?: string
        companyPhone?: string
        companyLicense?: string
        userName?: string
      } = {
        clientName: 'John Smith',
        propertyAddress: '123 Main St, Anytown, USA',
        projectDetails: {
          totalSqft: 2000,
          coats: 2,
          paintQuality: 'best' as const,
          rooms: [
            {
              name: 'Living Room',
              sqft: 500,
              windowsCount: 2,
              doorsCount: 1,
              ceilingIncluded: true,
              trimIncluded: true
            },
            {
              name: 'Kitchen',
              sqft: 300,
              windowsCount: 1,
              doorsCount: 2,
              ceilingIncluded: false,
              trimIncluded: true
            },
            {
              name: 'Master Bedroom',
              sqft: 400,
              windowsCount: 3,
              doorsCount: 1,
              ceilingIncluded: true,
              trimIncluded: true
            }
          ]
        },
        baseCosts: {
          labor: 1200,
          paint: 800,
          supplies: 300
        },
        markupPercentage: 20,
        companyName: 'Professional Painting Co.',
        companyPhone: '(555) 123-4567',
        companyLicense: 'License #ABC123',
        userName: 'Mike Wilson'
      }

      const blob = await generateQuotePDF(sampleData)
      const url = URL.createObjectURL(blob)
      
      // Create a link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = 'test-quote.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'PDF Generated',
        description: 'Test quote PDF has been generated and downloaded.',
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate test quote PDF.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Quote Generation</h1>
      <div className="max-w-xl">
        <p className="text-muted-foreground mb-6">
          This page allows you to test the PDF quote generation with sample data.
          Click the button below to generate and download a test quote PDF.
        </p>
        <Button
          onClick={handleGenerateTest}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Test Quote'}
        </Button>
      </div>
    </div>
  )
}
