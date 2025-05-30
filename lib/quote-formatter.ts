import { formatCurrency } from './utils'
import type { BaseCosts, ProjectDetails } from '@/types/database'

interface QuoteFormatData {
  quote: {
    id: string
    base_costs: BaseCosts
    markup_percentage: number
    final_price: number
    details: ProjectDetails
    valid_until: string
    created_at: string
  }
  project: {
    client_name: string
    property_address: string
  }
  profile: {
    company_name?: string
    phone?: string
    business_info?: any
  }
  user: {
    email?: string
  }
}

export function formatQuoteForCopy(data: QuoteFormatData): string {
  const { quote, project, profile, user } = data
  const companyName = profile.company_name || 'Professional Painting Co.'
  const phone = profile.phone || ''
  const email = user.email || ''
  
  const createdDate = new Date(quote.created_at).toLocaleDateString()
  const validUntilDate = new Date(quote.valid_until).toLocaleDateString()
  
  // Generate scope items from quote details
  const scopeItems = generateScopeItems(quote.details, quote.base_costs, quote.final_price)
  
  let formattedQuote = `PAINTING ESTIMATE

Company: ${companyName}`

  if (phone) {
    formattedQuote += `
Contact: ${phone}`
    if (email) {
      formattedQuote += ` | ${email}`
    }
  } else if (email) {
    formattedQuote += `
Contact: ${email}`
  }

  formattedQuote += `

Client: ${project.client_name}
Property: ${project.property_address}
Date: ${createdDate}
Valid Until: ${validUntilDate}

SCOPE OF WORK:`

  scopeItems.forEach(item => {
    formattedQuote += `
• ${item}`
  })

  formattedQuote += `

TOTAL ESTIMATE: ${formatCurrency(quote.final_price)}

This estimate includes all labor, materials, and supplies.
Terms: 50% deposit required, balance due on completion.

Thank you for considering ${companyName} for your painting needs!`

  if (phone) {
    formattedQuote += `
Questions? Contact us at ${phone}`
  }

  return formattedQuote
}

function generateScopeItems(details: ProjectDetails, baseCosts: BaseCosts, finalPrice: number): string[] {
  const items: string[] = []
  
  if (details.rooms && details.rooms.length > 0) {
    // Calculate room-specific pricing
    details.rooms.forEach(room => {
      const roomPercentage = room.sqft / details.totalSqft
      const roomPrice = finalPrice * roomPercentage
      
      let description = `${room.name} (${room.sqft} sq ft)`
      if (details.coats) {
        description += ` - ${details.coats} coats`
      }
      if (details.paintQuality) {
        description += `, ${details.paintQuality} quality paint`
      }
      description += `: ${formatCurrency(roomPrice)}`
      
      items.push(description)
    })
  } else {
    // Fallback to cost breakdown if no room details
    if (baseCosts.labor > 0) {
      items.push(`Professional painting labor: ${formatCurrency(baseCosts.labor)}`)
    }
    if (baseCosts.paint > 0) {
      const paintQuality = details.paintQuality || 'quality'
      items.push(`${paintQuality.charAt(0).toUpperCase() + paintQuality.slice(1)} paint: ${formatCurrency(baseCosts.paint)}`)
    }
    if (baseCosts.supplies > 0) {
      items.push(`Supplies and materials: ${formatCurrency(baseCosts.supplies)}`)
    }
  }
  
  return items
}

export function isQuoteExpired(validUntil: string): boolean {
  const expiryDate = new Date(validUntil)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day
  return expiryDate < today
}

export function getQuoteStatus(validUntil: string): 'valid' | 'expired' {
  return isQuoteExpired(validUntil) ? 'expired' : 'valid'
}
