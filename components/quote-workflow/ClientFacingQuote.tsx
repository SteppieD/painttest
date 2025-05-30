'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ClientFacingQuoteProps {
  quoteId: string
  quoteNumber: string
  companyName: string
  companyLogo?: string
  companyEmail?: string
  companyPhone?: string
  clientName: string
  propertyAddress: string
  createdAt: string
  validUntil: string
  finalPrice: number
  quoteMethod: 'simple' | 'detailed'
  projectDetails: any
  status: string
  termsAndConditions?: string
  onAcceptQuote: () => Promise<void>
}

export default function ClientFacingQuote({
  quoteId,
  quoteNumber,
  companyName,
  companyLogo,
  companyEmail,
  companyPhone,
  clientName,
  propertyAddress,
  createdAt,
  validUntil,
  finalPrice,
  quoteMethod,
  projectDetails,
  status,
  termsAndConditions,
  onAcceptQuote
}: ClientFacingQuoteProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const isAccepted = status === 'accepted' || status === 'completed'
  const isExpired = new Date(validUntil) < new Date()
  
  // Format Date Objects
  const issueDate = new Date(createdAt).toLocaleDateString()
  const expirationDate = new Date(validUntil).toLocaleDateString()
  
  const handleAcceptQuote = async () => {
    if (isAccepted || isExpired) return
    
    try {
      setIsLoading(true)
      await onAcceptQuote()
    } catch (error) {
      console.error('Error accepting quote:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Calculate total square footage
  const calculateTotalSquareFootage = () => {
    if (quoteMethod === 'detailed') {
      // For detailed quotes, calculate from rooms
      const rooms = projectDetails?.rooms || []
      let total = 0
      
      rooms.forEach((room: any) => {
        if (room.wall_lengths && room.ceiling_height) {
          // Calculate perimeter
          const wallLengths = room.wall_lengths as number[] || []
          const perimeter = wallLengths.reduce((sum: number, length: number) => sum + length, 0)
          
          // Wall area = perimeter × height
          const wallArea = perimeter * room.ceiling_height
          
          // Add to total
          total += wallArea
          
          // Add ceiling if included
          if (room.ceiling_included) {
            // Simple calculation - assuming rectangular room
            const length = wallLengths[0] || 0
            const width = wallLengths[1] || 0
            total += length * width
          }
        }
      })
      
      return Math.round(total) || 0 // Ensure we return 0 if the value is falsy
    } else {
      // For simple quotes, sum square footage from surfaces
      const surfaces = projectDetails?.surfaces || []
      const totalSqFt = surfaces.reduce((sum: number, surface: any) => {
        return sum + (parseFloat(surface.square_footage) || 0)
      }, 0)
      
      return Math.round(totalSqFt) || 0 // Ensure we return 0 if the value is falsy
    }
  }
  
  // Calculate total trim linear feet
  const calculateTotalTrimFootage = () => {
    if (quoteMethod === 'detailed') {
      // For detailed quotes, get from room details
      const rooms = projectDetails?.rooms || []
      let total = 0
      
      rooms.forEach((room: any) => {
        // Add baseboard length
        total += parseFloat(room.baseboard_length) || 0
      })
      
      return Math.round(total) || 0 // Ensure we return 0 if the value is falsy
    } else {
      // For simple quotes, filter for trim surfaces
      const surfaces = projectDetails?.surfaces || []
      const trimSurfaces = surfaces.filter((surface: any) => 
        surface.surface_type?.toLowerCase().includes('trim') || 
        surface.surface_type?.toLowerCase().includes('door') ||
        surface.surface_type?.toLowerCase().includes('baseboard')
      )
      
      const totalTrim = trimSurfaces.reduce((sum: number, surface: any) => {
        return sum + (parseFloat(surface.trim_footage) || parseFloat(surface.square_footage) || 0)
      }, 0)
      
      return Math.round(totalTrim) || 0 // Ensure we return 0 if the value is falsy
    }
  }
  
  // Count total doors
  const countTotalDoors = () => {
    if (quoteMethod === 'detailed') {
      // For detailed quotes, sum door counts
      const rooms = projectDetails?.rooms || []
      const totalDoors = rooms.reduce((sum: number, room: any) => {
        return sum + (parseInt(room.door_count) || 0)
      }, 0)
      
      return totalDoors || 0 // Ensure we return 0 if the value is falsy
    } else {
      // For simple quotes, check for door-specific surfaces
      const surfaces = projectDetails?.surfaces || []
      const doorSurfaces = surfaces.filter((surface: any) => 
        surface.surface_type?.toLowerCase().includes('door')
      )
      
      return doorSurfaces.length || 0 // Already returns 0 if no doors
    }
  }
  
  // Create professional work description table
  const createWorkDescriptionTable = () => {
    // Common defaults for paint types
    const defaultPaints = {
      'walls': 'Premium Interior Eggshell',
      'ceiling': 'Ceiling Flat White',
      'trim': 'Semi-Gloss Enamel',
      'doors': 'Semi-Gloss Enamel',
      'default': 'Quality Interior Paint'
    }
    
    // Handle empty data case
    const rooms = projectDetails?.rooms || []
    const surfaces = projectDetails?.surfaces || []
    
    if (rooms.length === 0 && surfaces.length === 0) {
      return (
        <tr className="border-b">
          <td colSpan={4} className="py-4 text-center text-muted-foreground italic">
            Surface and room details will be added during consultation
          </td>
        </tr>
      )
    }
    
    if (quoteMethod === 'detailed') {
      // For detailed quotes, create table rows by room
      
      if (rooms.length === 0) {
        return (
          <tr className="border-b">
            <td colSpan={4} className="py-4 text-center text-muted-foreground italic">
              Room details will be added during consultation
            </td>
          </tr>
        )
      }
      
      return rooms.map((room: any, index: number) => {
        const rows = []
        
        // Wall row
        if (room.wall_lengths && room.ceiling_height) {
          const wallLengths = room.wall_lengths as number[] || []
          const perimeter = wallLengths.reduce((sum: number, length: number) => sum + length, 0)
          const wallArea = perimeter * room.ceiling_height
          
          rows.push(
            <tr key={`${index}-walls`} className="border-b">
              <td className="py-2">{room.room_name || 'Room'} ({Math.round(wallArea)} sqft)</td>
              <td className="py-2">Walls prepared and painted</td>
              <td className="py-2 text-center">2</td>
              <td className="py-2">{defaultPaints.walls}</td>
            </tr>
          )
        }
        
        // Ceiling row
        if (room.ceiling_included && room.wall_lengths) {
          const wallLengths = room.wall_lengths as number[] || []
          if (wallLengths.length >= 2) {
            const area = wallLengths[0] * wallLengths[1]
            
            rows.push(
              <tr key={`${index}-ceiling`} className="border-b">
                <td className="py-2">{room.room_name || 'Room'} Ceiling ({Math.round(area)} sqft)</td>
                <td className="py-2">Ceiling prepared and painted</td>
                <td className="py-2 text-center">1</td>
                <td className="py-2">{defaultPaints.ceiling}</td>
              </tr>
            )
          }
        }
        
        // Trim row
        if (room.trim_included || room.baseboard_length > 0) {
          rows.push(
            <tr key={`${index}-trim`} className="border-b">
              <td className="py-2">{room.room_name || 'Room'} Trim ({room.baseboard_length || 'N/A'} linear ft)</td>
              <td className="py-2">Trim prepared and painted</td>
              <td className="py-2 text-center">2</td>
              <td className="py-2">{defaultPaints.trim}</td>
            </tr>
          )
        }
        
        // Doors row
        if (room.door_count && room.door_count > 0) {
          rows.push(
            <tr key={`${index}-doors`} className="border-b">
              <td className="py-2">{room.room_name || 'Room'} Doors ({room.door_count})</td>
              <td className="py-2">Doors prepared and painted</td>
              <td className="py-2 text-center">2</td>
              <td className="py-2">{defaultPaints.doors}</td>
            </tr>
          )
        }
        
        return rows
      }).flat()
      
    } else {
      // For simple quotes, create rows by surface type
      
      if (surfaces.length === 0) {
        return (
          <tr className="border-b">
            <td colSpan={4} className="py-4 text-center text-muted-foreground italic">
              Surface details will be added during consultation
            </td>
          </tr>
        )
      }
      
      return surfaces.map((surface: any, index: number) => {
        // Determine surface description
        let description = 'Surface prepared and painted'
        if (surface.surface_type?.toLowerCase().includes('wall')) {
          description = 'Walls patched, prepped, and painted'
        } else if (surface.surface_type?.toLowerCase().includes('ceiling')) {
          description = 'Ceiling prepared and painted'
        } else if (surface.surface_type?.toLowerCase().includes('trim') || 
                  surface.surface_type?.toLowerCase().includes('baseboard')) {
          description = 'Trim sanded, caulked, and painted'
        } else if (surface.surface_type?.toLowerCase().includes('door')) {
          description = 'Doors sanded, prepped, and painted'
        }
        
        // Determine paint type
        let paintType = surface.paint_product?.product_name || 
                        surface.custom_paint_name || 
                        null
        
        // Try to get default paint type based on surface type
        if (surface.surface_type) {
          const surfaceTypeLower = surface.surface_type.toLowerCase()
          if (surfaceTypeLower.includes('wall')) {
            paintType = defaultPaints.walls
          } else if (surfaceTypeLower.includes('ceiling')) {
            paintType = defaultPaints.ceiling
          } else if (surfaceTypeLower.includes('trim') || surfaceTypeLower.includes('baseboard')) {
            paintType = defaultPaints.trim
          } else if (surfaceTypeLower.includes('door')) {
            paintType = defaultPaints.doors
          }
        }
        
        // Determine coats
        let coats = surface.coats || 2
        if (surface.surface_type?.toLowerCase().includes('ceiling')) {
          coats = surface.coats || 1
        }
        
        return (
          <tr key={index} className="border-b">
            <td className="py-2">{surface.surface_type || `Surface ${index + 1}`} ({Math.round(parseFloat(surface.square_footage) || 0)} sqft)</td>
            <td className="py-2">{description || 'Standard preparation and painting'}</td>
            <td className="py-2 text-center">{coats || 2}</td>
            <td className="py-2">{paintType || defaultPaints.default}</td>
          </tr>
        )
      })
    }
  }
  
  // Format project details with enhanced scope information
  const formatProjectDetails = () => {
    // Calculate total coverage
    const totalSqFt = calculateTotalSquareFootage()
    const totalTrimFt = calculateTotalTrimFootage()
    const totalDoors = countTotalDoors()
    
    return (
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Project Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">Total Paint Area:</span> {totalSqFt || 0} sq ft
            </div>
            <div>
              <span className="font-medium">Total Trim:</span> {totalTrimFt || 0} linear ft
            </div>
            <div>
              <span className="font-medium">Doors:</span> {totalDoors || 0}
            </div>
          </div>
        </div>
        
        {/* Work Description Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="py-2 px-2 text-left font-medium">Area</th>
                <th className="py-2 px-2 text-left font-medium">Description</th>
                <th className="py-2 px-2 text-center font-medium">Coats</th>
                <th className="py-2 px-2 text-left font-medium">Paint Type</th>
              </tr>
            </thead>
            <tbody>
              {createWorkDescriptionTable()}
            </tbody>
          </table>
        </div>
        
        {/* Surface Preparation */}
        <div>
          <h4 className="font-medium mb-2">Surface Preparation Included:</h4>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li>Light patching and sanding of wall surfaces</li>
            <li>Caulking gaps around trim and filling nail holes</li>
            <li>Surface cleaning and spot priming where needed</li>
            <li>Complete protection of floors, furniture and fixtures</li>
            <li>Thorough cleanup and debris removal upon completion</li>
          </ul>
        </div>
        
        {/* Paint Specifications */}
        <div>
          <h4 className="font-medium mb-2">Paint Specifications:</h4>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li>Premium quality interior paints for durability and washability</li>
            <li>Industry standard application techniques for smooth, even finish</li>
            <li>Professional equipment and tools for superior results</li>
            <li>Colors to be selected by client (samples available upon request)</li>
          </ul>
        </div>
      </div>
    )
  }
  
  // Format terms and conditions with defaults if not provided
  const formattedTerms = termsAndConditions || `
    1. This quote is valid until ${expirationDate}.
    2. 50% deposit required to begin work.
    3. Final balance due upon completion.
    4. Any additional work not specified will be quoted separately.
    5. We guarantee our workmanship for 2 years.
    6. This quote assumes normal working conditions and unhindered access to all areas.
  `
  
  return (
    <Card className="w-full max-w-4xl mx-auto border shadow-sm print:shadow-none">
      <CardContent className="p-6 md:p-8 space-y-8">
        {/* Header with company info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            {companyLogo ? (
              <div className="h-16 w-auto mb-2 relative">
                <Image
                  src={companyLogo}
                  alt={companyName}
                  width={180}
                  height={64}
                  style={{ objectFit: 'contain', maxHeight: '64px', width: 'auto' }}
                />
              </div>
            ) : (
              <h1 className="text-2xl font-bold">{companyName}</h1>
            )}
            <div className="text-sm text-muted-foreground">
              {companyPhone && <p>{companyPhone}</p>}
              {companyEmail && <p>{companyEmail}</p>}
            </div>
          </div>
          
          <div className="space-y-1 text-right">
            <h2 className="text-xl font-bold">Painting Quote</h2>
            <p className="text-sm text-muted-foreground">Quote #{quoteNumber}</p>
            <p className="text-sm">Issue Date: {issueDate}</p>
            <p className="text-sm">Valid Until: {expirationDate}</p>
          </div>
        </div>
        
        {/* Client Info */}
        <div className="border-t border-b py-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Prepared For:</p>
              <p className="font-medium">{clientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Property Address:</p>
              <p>{propertyAddress}</p>
            </div>
          </div>
        </div>
        
        {/* Project Scope */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Project Scope</h3>
          {formatProjectDetails()}
        </div>
        
        {/* Total Price */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total Price:</span>
            <span>{formatCurrency(finalPrice)}</span>
          </div>
        </div>
        
        {/* Terms & Conditions */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Terms & Conditions</h3>
          <div className="text-sm whitespace-pre-line">
            {formattedTerms}
          </div>
        </div>
        
        {/* Acceptance */}
        {!isAccepted ? (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
            <p className="text-sm mb-4">
              By accepting this quote, you agree to the terms and conditions outlined above.
            </p>
            
            {isExpired ? (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
                This quote has expired. Please contact us for an updated quote.
              </div>
            ) : (
              <Button 
                onClick={handleAcceptQuote} 
                className="w-full md:w-auto"
                disabled={isLoading || isExpired}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Accept Quote'
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckCircle2 className="text-green-600 h-6 w-6" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-400">Quote Accepted</p>
              <p className="text-sm text-green-700 dark:text-green-500">Thank you for your business!</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-6 text-center text-sm text-muted-foreground print:pb-0">
        <p>Thank you for choosing {companyName}. We look forward to working with you!</p>
      </CardFooter>
    </Card>
  )
}
