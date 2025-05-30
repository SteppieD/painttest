'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ClientFacingQuote from '@/components/quote-workflow/ClientFacingQuote'

export default function TestClientFacingQuotePage() {
  // Mock data for testing
  const mockQuotes = {
    // Complete data case
    complete: {
      quoteId: 'test-123',
      quoteNumber: 'Q-12345',
      companyName: 'Professional Painting Co.',
      companyLogo: 'https://placehold.co/200x80',
      companyEmail: 'info@propainting.com',
      companyPhone: '(555) 123-4567',
      clientName: 'Jane Smith',
      propertyAddress: '123 Main Street, Springfield, IL 12345',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      finalPrice: 3500,
      quoteMethod: 'simple' as const,
      projectDetails: {
        surfaces: [
          {
            surface_type: 'Walls',
            square_footage: 800,
            coats: 2,
            paint_product: { product_name: 'Premium Eggshell' }
          },
          {
            surface_type: 'Trim',
            square_footage: 120,
            trim_footage: 200,
            coats: 2,
            paint_product: { product_name: 'Semi-Gloss Enamel' }
          },
          {
            surface_type: 'Doors',
            square_footage: 80,
            coats: 2,
            paint_product: { product_name: 'Door & Trim Paint' }
          }
        ]
      },
      status: 'quoted',
      termsAndConditions: '1. 30-day quote validity\n2. 50% deposit required\n3. Balance due upon completion'
    },
    
    // Missing data case
    incomplete: {
      quoteId: 'test-456',
      quoteNumber: 'Q-67890',
      companyName: 'Professional Painting Co.',
      companyLogo: 'https://placehold.co/200x80',
      companyEmail: 'info@propainting.com',
      companyPhone: '(555) 123-4567',
      clientName: 'John Doe',
      propertyAddress: '456 Oak Avenue, Springfield, IL 12345',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      finalPrice: 2800,
      quoteMethod: 'simple' as const,
      projectDetails: {
        surfaces: [
          {
            surface_type: 'Walls',
            // Missing square_footage
            coats: 2
            // Missing paint_product
          },
          {
            surface_type: 'Trim',
            // Missing square_footage and trim_footage
          },
          {
            surface_type: 'Ceiling',
            square_footage: 200
            // Missing coats and paint_product
          }
        ]
      },
      status: 'quoted',
      termsAndConditions: '1. 30-day quote validity\n2. 50% deposit required\n3. Balance due upon completion'
    },
    
    // Empty data case
    empty: {
      quoteId: 'test-789',
      quoteNumber: 'Q-11223',
      companyName: 'Professional Painting Co.',
      companyLogo: 'https://placehold.co/200x80',
      companyEmail: 'info@propainting.com',
      companyPhone: '(555) 123-4567',
      clientName: 'Alex Johnson',
      propertyAddress: '789 Pine Road, Springfield, IL 12345',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      finalPrice: 1500,
      quoteMethod: 'simple' as const,
      projectDetails: {
        // Completely empty project details to test placeholder message
        surfaces: []
      },
      status: 'quoted',
      termsAndConditions: '1. 30-day quote validity\n2. 50% deposit required\n3. Balance due upon completion'
    },
    // Detailed quote test case
    detailed: {
      quoteId: 'test-456',
      quoteNumber: 'Q-67890',
      companyName: 'Professional Painting Co.',
      companyLogo: 'https://placehold.co/200x80',
      companyEmail: 'info@propainting.com',
      companyPhone: '(555) 123-4567',
      clientName: 'Robert Smith',
      propertyAddress: '123 Oak Lane, Springfield, IL 12345',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      finalPrice: 4200,
      quoteMethod: 'detailed' as const,
      projectDetails: {
        rooms: [
          {
            room_name: 'Living Room',
            wall_lengths: [12, 15, 12, 15],
            ceiling_height: 8,
            ceiling_included: true,
            baseboard_length: 54,
            trim_included: true,
            door_count: 2
          },
          {
            room_name: 'Master Bedroom',
            wall_lengths: [10, 12, 10, 12],
            ceiling_height: 8,
            ceiling_included: false,
            baseboard_length: 44,
            trim_included: true,
            door_count: 1
          }
        ]
      },
      status: 'quoted',
      termsAndConditions: '1. 30-day quote validity\n2. 50% deposit required\n3. Balance due upon completion'
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">ClientFacingQuote Component Test</h1>
      <p className="text-muted-foreground">
        This page tests the ClientFacingQuote component with various data scenarios to ensure proper rendering.
      </p>
      
      <Tabs defaultValue="complete">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="complete">Complete Data</TabsTrigger>
          <TabsTrigger value="incomplete">Incomplete Data</TabsTrigger>
          <TabsTrigger value="empty">Empty Data</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Quote</TabsTrigger>
        </TabsList>
        
        <TabsContent value="complete" className="mt-4">
          <Card className="border-2 border-green-200">
            <div className="p-4 bg-green-50">
              <h2 className="font-bold">Complete Data Test</h2>
              <p className="text-sm text-muted-foreground">
                All data fields are provided. Numbers should display properly, and all table columns should have values.
              </p>
            </div>
            <ClientFacingQuote 
              {...mockQuotes.complete}
              onAcceptQuote={async () => {
                console.log('Quote accepted')
                return Promise.resolve()
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="incomplete" className="mt-4">
          <Card className="border-2 border-yellow-200">
            <div className="p-4 bg-yellow-50">
              <h2 className="font-bold">Incomplete Data Test</h2>
              <p className="text-sm text-muted-foreground">
                Some data fields are missing. Missing numbers should display as 0, and table columns should fall back to defaults.
              </p>
            </div>
            <ClientFacingQuote 
              {...mockQuotes.incomplete}
              onAcceptQuote={async () => {
                console.log('Quote accepted')
                return Promise.resolve()
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="empty" className="mt-4">
          <Card className="border-2 border-blue-200">
            <div className="p-4 bg-blue-50">
              <h2 className="font-bold">Empty Data Test</h2>
              <p className="text-sm text-muted-foreground">
                No surfaces data. Table should show a placeholder message and all totals should be 0.
              </p>
            </div>
            <ClientFacingQuote 
              {...mockQuotes.empty}
              onAcceptQuote={async () => {
                console.log('Quote accepted')
                return Promise.resolve()
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="detailed" className="mt-4">
          <Card className="border-2 border-purple-200">
            <div className="p-4 bg-purple-50">
              <h2 className="font-bold">Detailed Quote Test</h2>
              <p className="text-sm text-muted-foreground">
                Uses the &quot;detailed&quot; quote method with room data instead of surfaces.
              </p>
            </div>
            <ClientFacingQuote 
              {...mockQuotes.detailed}
              onAcceptQuote={async () => {
                console.log('Quote accepted')
                return Promise.resolve()
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
