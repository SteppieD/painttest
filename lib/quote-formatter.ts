import { formatCurrency, formatDate } from './utils'

interface QuoteData {
  quote: any
  project: any
  profile: any
}

// Helper functions
const getQuoteItems = (details: any) => {
  if (details.items) return details.items
  if (details.rooms) {
    return details.rooms.map((room: any) => ({
      name: room.name,
      sqft: room.sqft || 0,
      description: `${room.name} patched, prepped, and painted`,
      coats: details.coats || 2,
      paintType: getPaintTypeForItem(room.name),
      ceilingIncluded: room.ceilingIncluded,
      trimIncluded: room.trimIncluded
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

const calculateTotals = (details: any, quote: any) => {
  const items = getQuoteItems(details)
  const totalSqft = quote.total_sqft || details.totalSqft || items.reduce((sum: number, item: any) => sum + (item.sqft || 0), 0)
  const totalTrim = details.totalTrim || items.reduce((sum: number, item: any) => {
    if (item.trimIncluded && item.sqft) {
      return sum + Math.ceil(Math.sqrt(item.sqft) * 4 * 0.8)
    }
    return sum
  }, 0)
  const totalDoors = details.doors || items.reduce((sum: number, item: any) => sum + (item.doorsCount || 1), 0)
  
  return { totalSqft, totalTrim, totalDoors, items }
}

export function formatQuoteForCopy({ quote, project, profile }: QuoteData): string {
  const details = quote.details as any
  const { totalSqft, totalTrim, totalDoors, items } = calculateTotals(details, quote)

  return `${profile?.company_name || 'Professional Painting Co.'}
${profile?.phone ? `(${profile.phone})` : '(555) 123-4567'}
${profile?.email || 'info@propainting.com'}

PAINTING QUOTE
Quote #${quote.quote_number || quote.id.slice(0, 8).toUpperCase()}

Issue Date: ${formatDate(quote.created_at)}
Valid Until: ${formatDate(quote.valid_until)}

PREPARED FOR:
${project.client_name}

PROPERTY ADDRESS:
${project.property_address}

PROJECT SCOPE
=============

Project Summary:
• Total Paint Area: ${totalSqft} sq ft
• Total Trim: ${totalTrim} linear ft
• Doors: ${totalDoors}

Surface Breakdown:
${items.map((item: any) => {
  return `• ${item.name} (${item.sqft} sqft) - ${item.description} - ${item.coats} coats - ${item.paintType}`
}).join('\n')}

Surface Preparation Included:
• Light patching and sanding of wall surfaces
• Caulking gaps around trim and filling nail holes
• Surface cleaning and spot priming where needed
• Complete protection of floors, furniture and fixtures
• Thorough cleanup and debris removal upon completion

Paint Specifications:
• Premium quality interior paints for durability and washability
• Industry standard application techniques for smooth, even finish
• Professional equipment and tools for superior results
• Colors to be selected by client (samples available upon request)

TOTAL PRICE: ${formatCurrency(quote.final_price)}

TERMS & CONDITIONS
==================
1. 30-day quote validity
2. 50% deposit required
3. Balance due upon completion

By accepting this quote, you agree to the terms and conditions outlined above.

Thank you for choosing ${profile?.company_name || 'Professional Painting Co.'}. We look forward to working with you!`
}

export function generateProfessionalQuoteHTML({ quote, project, profile }: QuoteData): string {
  const details = quote.details as any
  const { totalSqft, totalTrim, totalDoors, items } = calculateTotals(details, quote)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quote #${quote.quote_number || quote.id.slice(0, 8).toUpperCase()}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 30px; 
    }
    .company-info h1 { 
      margin: 0 0 5px 0; 
      color: #2563eb; 
    }
    .quote-info { 
      text-align: right; 
    }
    .quote-info h2 { 
      margin: 0 0 5px 0; 
    }
    .client-info { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 5px; 
      margin-bottom: 30px; 
    }
    .section { 
      margin-bottom: 30px; 
    }
    .section h3 { 
      color: #2563eb; 
      border-bottom: 2px solid #2563eb; 
      padding-bottom: 5px; 
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0; 
    }
    th, td { 
      padding: 10px; 
      text-align: left; 
      border-bottom: 1px solid #ddd; 
    }
    th { 
      background: #f5f5f5; 
      font-weight: bold; 
    }
    .summary-box { 
      background: #e0f2fe; 
      padding: 15px; 
      border-radius: 5px; 
      margin: 15px 0; 
    }
    .price-box { 
      background: #2563eb; 
      color: white; 
      padding: 20px; 
      text-align: center; 
      border-radius: 5px; 
      margin: 30px 0; 
    }
    .price-box .price { 
      font-size: 32px; 
      font-weight: bold; 
    }
    ul { 
      padding-left: 20px; 
    }
    .terms { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 5px; 
    }
    .footer { 
      text-align: center; 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #ddd; 
    }
    @media print {
      body { padding: 0; }
      .price-box { background: #f5f5f5; color: #333; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${profile?.company_name || 'Professional Painting Co.'}</h1>
      <p>${profile?.phone || '(555) 123-4567'}<br>
      ${profile?.email || 'info@propainting.com'}</p>
    </div>
    <div class="quote-info">
      <h2>Painting Quote</h2>
      <p>Quote #${quote.quote_number || quote.id.slice(0, 8).toUpperCase()}<br>
      Issue Date: ${formatDate(quote.created_at)}<br>
      Valid Until: ${formatDate(quote.valid_until)}</p>
    </div>
  </div>

  <div class="client-info">
    <strong>Prepared For:</strong><br>
    ${project.client_name}<br><br>
    <strong>Property Address:</strong><br>
    ${project.property_address}
  </div>

  <div class="section">
    <h3>Project Scope</h3>
    
    <div class="summary-box">
      <strong>Project Summary</strong><br>
      Total Paint Area: ${totalSqft} sq ft<br>
      Total Trim: ${totalTrim} linear ft<br>
      Doors: ${totalDoors}
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Description</th>
          <th>Coats</th>
          <th>Paint Type</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: any) => {
          return `
        <tr>
          <td>${item.name} (${item.sqft} sqft)</td>
          <td>${item.description}</td>
          <td style="text-align: center">${item.coats}</td>
          <td>${item.paintType}</td>
        </tr>`
        }).join('')}
      </tbody>
    </table>

    <strong>Surface Preparation Included:</strong>
    <ul>
      <li>Light patching and sanding of wall surfaces</li>
      <li>Caulking gaps around trim and filling nail holes</li>
      <li>Surface cleaning and spot priming where needed</li>
      <li>Complete protection of floors, furniture and fixtures</li>
      <li>Thorough cleanup and debris removal upon completion</li>
    </ul>

    <strong>Paint Specifications:</strong>
    <ul>
      <li>Premium quality interior paints for durability and washability</li>
      <li>Industry standard application techniques for smooth, even finish</li>
      <li>Professional equipment and tools for superior results</li>
      <li>Colors to be selected by client (samples available upon request)</li>
    </ul>
  </div>

  <div class="price-box">
    <div>Total Price:</div>
    <div class="price">${formatCurrency(quote.final_price)}</div>
  </div>

  <div class="section terms">
    <h3>Terms & Conditions</h3>
    <ol>
      <li>30-day quote validity</li>
      <li>50% deposit required</li>
      <li>Balance due upon completion</li>
    </ol>
    <p><em>By accepting this quote, you agree to the terms and conditions outlined above.</em></p>
  </div>

  <div class="footer">
    <p>Thank you for choosing ${profile?.company_name || 'Professional Painting Co.'}. We look forward to working with you!</p>
  </div>
</body>
</html>
  `
}