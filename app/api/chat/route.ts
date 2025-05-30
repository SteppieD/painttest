import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Ensure the API key is properly loaded from environment variables
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables')
  throw new Error('Missing GEMINI_API_KEY environment variable')
}

// Initialize the Google Generative AI client with proper error handling
let genAI: any
try {
  genAI = new GoogleGenerativeAI(apiKey)
  console.log('Gemini API initialized successfully')
} catch (error) {
  console.error('Failed to initialize Gemini API:', error)
  throw new Error('Failed to initialize Gemini API')
}

// Import calculation utilities
import { 
  calculateSimpleQuote, 
  calculateAdvancedQuote, 
  calculateMarkup 
} from '@/lib/quote-calculators'
import { SurfaceType } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationState, messages, userId } = await request.json()

    // Initialize Gemini model with error handling
    let model
    try {
      model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
      console.log('Gemini model loaded successfully')
    } catch (err) {
      console.error('Failed to get Gemini model:', err)
      return NextResponse.json(
        { error: 'Failed to initialize AI model' },
        { status: 500 }
      )
    }

    // Get cost settings with all the new fields
    const supabase = await createClient()
    const { data: costSettings } = await supabase
      .from('cost_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    const defaultCosts = {
      labor_cost_per_hour: 25,
      paint_costs: { good: 25, better: 35, best: 50 },
      supplies_base_cost: 100,
      default_labor_percentage: 30,
      default_spread_rate: 350,
      door_trim_pricing: { door_unit_price: 45, trim_linear_foot_price: 3 },
      baseboard_pricing: { charge_method: 'linear_foot', price_per_linear_foot: 2.5 },
      default_rates: { walls: 3.00, ceilings: 2.00, trim_doors: 5.00 },
      default_paint_costs: { walls: 26, ceilings: 25, trim_doors: 35 }
    }

    const costs = costSettings || defaultCosts

    // Build conversation history
    const conversationHistory = messages.map((m: any) => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n')
    
    // Add industry knowledge (would normally come from Context7 MCP)
    const paintingKnowledge = `
PAINTING INDUSTRY KNOWLEDGE:

1. SURFACE PREPARATION
- Proper surface preparation is essential for a quality paint job.
- Steps include: cleaning, sanding, patching, priming.
- Labor costs typically account for 70-85% of a painting project.

2. PAINT COVERAGE & QUALITY
- Standard coverage: 350 sq.ft per gallon per coat.
- Paint quality tiers:
  * Good: Basic coverage, 3-5 year lifespan ($25-35/gallon)
  * Better: Better coverage, 7-10 year lifespan ($35-50/gallon)
  * Best: Premium coverage, 15+ year lifespan ($50-70+/gallon)
- Two coats are ALWAYS standard for interior walls.
- Dark colors over light typically require additional coats.

3. ROOM COMPLEXITY FACTORS
- Wall height over 8ft increases labor costs by 15-20%.
- Vaulted ceilings add 20-30% to ceiling painting costs.
- Trim work is typically priced separately from walls.
- Detailed crown molding adds significant labor time.

4. INDUSTRY RULES OF THUMB
- 2 rooms take an 8 hour day for 1 person to complete
- 1 gallon of paint covers 4 doors and the door trim with 2 coats
- Doors and trim use unit pricing (no markup)
- Baseboards can be charged by linear foot or included with wall length
- Always ask about sundries budget (brushes, rollers, tape)

5. PRICING STRUCTURE
- Simple Quote: Price per square foot for each surface type
- Advanced Quote: Detailed room-by-room measurements with industry rules

6. COMMON PROFESSIONAL PAINTING ESTIMATES
- Bedroom (12x12): $300-600 (walls only, 2 coats)
- Living room (15x20): $500-800 (walls only, 2 coats)
- Kitchen (10x12): $250-500 (walls only, no cabinets)
- Bathroom (8x8): $150-350 (walls only)
- Interior door: $25-45 each (per side)
- Trim/baseboards: $1-3 per linear foot
- Ceiling (12x12): $150-300

7. POST-JOB TRACKING
- Always record actual labor and materials costs
- Compare against projected costs for profit/loss analysis
`

    const prompt = `You are an AI assistant helping a painting business owner create accurate quotes for their clients. Your role is to gather project details through natural conversation.

${paintingKnowledge}

Current conversation state: ${JSON.stringify(conversationState)}
Cost settings: ${JSON.stringify(costs)}

Key information to collect:
- Client name and property address
- Quote method (simple or advanced)
- For simple quotes: surface square footage, rates per sqft, paint costs
- For advanced quotes: room dimensions, door counts, trim details
- Paint requirements (coats, quality - good/better/best)
- Sundries budget (ask explicitly: "how much budget do you need for sundries (brushes, rollers, tape)?")
- Surface conditions
- Special requirements

IMPORTANT INSTRUCTIONS:
1. Be conversational and friendly
2. If the client hasn't chosen a quote method, ask if they want to create a "Simple Quote" (pricing by surface area) or an "Advanced Quote" (detailed room measurements)
3. For Advanced Quotes, collect wall lengths for room perimeter calculation
4. Always ask about doors and trim since they use unit pricing
5. Always ask about baseboards and whether they should be priced by linear foot or included with walls
6. Explicitly ask for sundries budget with: "how much budget do you need for sundries (brushes, rollers, tape)?"
7. When you have enough information, provide a BRIEF summary in this format:
   "Great! I have all the information I need. Here's a quick summary:
   - [Client name] at [address]
   - Quote Method: [Simple/Advanced]
   - [Number] rooms: [room types]
   - [X] coats of [quality] paint
   - Sundries budget: $[amount]
   
   Based on your cost settings, this will be approximately $[total cost] in costs.
   With your selected markup, the quote to the client will be around $[price].
   
   You can adjust the markup percentage on the right and generate the PDF when ready!"

8. Do NOT show detailed calculations or break down costs in the chat
9. Keep responses short and focused
10. Guide the conversation naturally

Conversation history:
${conversationHistory}

User: ${message}

Respond naturally and concisely. If you have all needed information, provide the brief summary as instructed.`

    // Generate content with more detailed error handling
    let text
    try {
      console.log('Sending prompt to Gemini API...')
      const result = await model.generateContent(prompt)
      const response = await result.response
      text = response.text()
      console.log('Received response from Gemini API')
    } catch (err: any) {
      console.error('Gemini API generation error:', err)
      return NextResponse.json(
        { error: `AI generation failed: ${err.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Parse the response to see if we need to create a project or update state
    let responseData: any = { response: text }

    // Extract useful information from message
    let extractedClientName = null
    let extractedAddress = null
    let shouldCreateProject = false
    
      // Try to extract client name and address from message
      const lowerMessage = message.toLowerCase()
      
      // Attempt to extract client and address information
      if ((lowerMessage.includes('name') || lowerMessage.includes('client')) && 
          (lowerMessage.includes('address') || lowerMessage.includes('property') || lowerMessage.includes('location'))) {
        
        // First attempt - look for explicit patterns
        const namePrefixes = ['client', 'name', 'client name', 'client\'s name', 'clients name is', 'for']
        const addressPrefixes = ['address', 'property', 'at', 'on', 'location']
        
        // Extract client name
        for (const prefix of namePrefixes) {
          const namePattern = new RegExp(`${prefix}\\s+is\\s+([^,\\.]+)`, 'i')
          const nameMatch = message.match(namePattern)
          if (nameMatch && nameMatch[1]) {
            extractedClientName = nameMatch[1].trim()
            break
          }
        }
        
        // If no match, try simpler pattern
        if (!extractedClientName && message.includes(',')) {
          const parts = message.split(',')
          if (parts.length >= 2) {
            extractedClientName = parts[0].replace(/my|client(s)?(\s+name)?(\s+is)?/i, '').trim()
          }
        }
        
        // Extract address
        for (const prefix of addressPrefixes) {
          const addressPattern = new RegExp(`${prefix}\\s+is\\s+([^,\\.]+)`, 'i')
          const addressMatch = message.match(addressPattern)
          if (addressMatch && addressMatch[1]) {
            extractedAddress = addressMatch[1].trim()
            break
          }
        }
        
        // If no address match but we have a name, try to get address from second part
        if (extractedClientName && !extractedAddress && message.includes(',')) {
          const parts = message.split(',')
          if (parts.length >= 2) {
            extractedAddress = parts[1].trim()
          }
        }
        
        shouldCreateProject = true
      }
    
    // Project creation logic
    if (conversationState.stage === 'gathering_info' && shouldCreateProject) {
      const clientName = extractedClientName || 'New Client'
      const propertyAddress = extractedAddress || 'Address pending'
      
      try {
        // Create a new project
        const { data: project } = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            client_name: clientName,
            property_address: propertyAddress
          })
          .select()
          .single()

        if (project) {
          responseData.projectId = project.id
          responseData.conversationState = {
            ...conversationState,
            clientName,
            propertyAddress,
            projectDetails: {
              rooms: [],
              totalSqft: 0,
              paintQuality: 'better',
              coats: 2
            }
          }
        }
      } catch (error) {
        console.error('Error creating project:', error)
        // Even if project creation fails, we don't want to fail the entire API call
        // We'll just continue without the project
      }
    }

    // Check if we have enough info to calculate costs
    // Also look for placeholders that need to be replaced
    const hasPlaceholders = text.includes('$[total cost]') || text.includes('$[price]');
    const readyToCalculate = (hasPlaceholders || text.includes('approximately $')) && conversationState.clientName;

    if (readyToCalculate) {
      // Determine which quote method was used
      const isSimpleQuote = text.toLowerCase().includes('simple quote') || 
                            message.toLowerCase().includes('simple quote') ||
                            conversationState.quoteMethod === 'simple';
      
      const quoteMethod = isSimpleQuote ? 'simple' : 'advanced';
      
      // Extract sundries cost - look for "sundries budget" in the text
      let sundriesCost = costs.supplies_base_cost; // default
      const sundriesMatch = text.match(/sundries budget: \$(\d+)/i) || 
                           message.match(/sundries budget.*\$?(\d+)/i) ||
                           message.match(/sundries.*\$?(\d+)/i);
      
      if (sundriesMatch && sundriesMatch[1]) {
        sundriesCost = parseInt(sundriesMatch[1]);
      }
      
      // Extract paint quality
      let paintQuality = 'better'; // default
      if (text.toLowerCase().includes('good quality') || message.toLowerCase().includes('good quality') ||
          text.toLowerCase().includes('good paint') || message.toLowerCase().includes('good paint')) {
        paintQuality = 'good';
      } else if (text.toLowerCase().includes('best quality') || message.toLowerCase().includes('best quality')) {
        paintQuality = 'best';
      }
      
      // Extract coats
      let coats = 2; // default is always 2
      const coatsMatch = text.match(/(\d+) coats?/i) || message.match(/(\d+) coats?/i);
      if (coatsMatch && coatsMatch[1]) {
        coats = parseInt(coatsMatch[1]);
      }
      
      let baseCosts: Record<string, number> = {};
      let projectDetails = {};
      
      if (isSimpleQuote) {
        // Simple quote calculation based on surface area
        // Parse surface information from conversation (this is simplified)
        const surfaces = [];
        
        // Try to extract total square footage directly
        let totalSqft = 0;
        
        // Look for specific square footage mentions
        const totalSqFtMatch = message.match(/(\d+)\s*sq\s*ft/i) || 
                              message.match(/(\d+)\s*square\s*f(oo|ee)t/i) ||
                              text.match(/(\d+)\s*sq\s*ft/i);
                              
        if (totalSqFtMatch && totalSqFtMatch[1]) {
          totalSqft = parseInt(totalSqFtMatch[1]);
        }
        
        // If no total found, try to detect individual surfaces
        if (totalSqft === 0) {
          // Example parsing for individual surface types
          const wallsMatch = message.match(/walls.*?(\d+)\s*sq\s*ft/i) || 
                            message.match(/(\d+)\s*sq\s*ft.*?walls/i);
          
          const ceilingsMatch = message.match(/ceilings?.*?(\d+)\s*sq\s*ft/i) || 
                               message.match(/(\d+)\s*sq\s*ft.*?ceilings?/i);
                               
          const trimMatch = message.match(/trim.*?(\d+)\s*sq\s*ft/i) || 
                           message.match(/(\d+)\s*sq\s*ft.*?trim/i);
          
          // Add walls surface if mentioned
          if (wallsMatch && wallsMatch[1]) {
            const sqft = parseInt(wallsMatch[1]);
            totalSqft += sqft;
            surfaces.push({
              type: 'walls' as SurfaceType,
              sqft,
              ratePerSqft: costs.default_rates?.walls || 3.00,
              paintCostPerGallon: costs.default_paint_costs?.walls || 26,
              spreadRate: costs.default_spread_rate || 350
            });
          }
          
          // Add ceilings surface if mentioned
          if (ceilingsMatch && ceilingsMatch[1]) {
            const sqft = parseInt(ceilingsMatch[1]);
            totalSqft += sqft;
            surfaces.push({
              type: 'ceilings' as SurfaceType,
              sqft,
              ratePerSqft: costs.default_rates?.ceilings || 2.00,
              paintCostPerGallon: costs.default_paint_costs?.ceilings || 25,
              spreadRate: costs.default_spread_rate || 350
            });
          }
          
          // Add trim surface if mentioned
          if (trimMatch && trimMatch[1]) {
            const sqft = parseInt(trimMatch[1]);
            totalSqft += sqft;
            surfaces.push({
              type: 'trim' as SurfaceType,
              sqft,
              ratePerSqft: costs.default_rates?.trim_doors || 5.00,
              paintCostPerGallon: costs.default_paint_costs?.trim_doors || 35,
              spreadRate: costs.default_spread_rate || 350
            });
          }
        }
        
        // If no surfaces were extracted, create a default one
        if (surfaces.length === 0 && totalSqft > 0) {
          // Create a default surface (walls) with extracted square footage
          surfaces.push({
            type: 'walls' as SurfaceType,
            sqft: totalSqft,
            ratePerSqft: costs.default_rates?.walls || 3.00,
            paintCostPerGallon: costs.default_paint_costs?.walls || 26,
            spreadRate: costs.default_spread_rate || 350
          });
        } else if (surfaces.length === 0) {
          // No surface area was mentioned at all, use a default
          const estimatedSqft = 500; // Default estimate
          totalSqft = estimatedSqft;
          surfaces.push({
            type: 'walls' as SurfaceType,
            sqft: estimatedSqft,
            ratePerSqft: costs.default_rates?.walls || 3.00,
            paintCostPerGallon: costs.default_paint_costs?.walls || 26,
            spreadRate: costs.default_spread_rate || 350
          });
        }
        
        // Calculate using the simple quote method
        const quoteResult = calculateSimpleQuote({
          surfaces,
          sundries: sundriesCost,
          laborPercentage: costs.default_labor_percentage || 30
        });
        
        // Transform to baseCosts format for storage
        baseCosts = {
          labor: quoteResult.laborEstimate,
          paint: quoteResult.totalMaterialsCost,
          supplies: sundriesCost
        };
        
        // Create projectDetails
        projectDetails = {
          surfaces: quoteResult.surfaceCalculations,
          totalSqft: totalSqft,
          paintQuality,
          coats,
          quoteMethod: 'simple'
        };
      } else {
        // Advanced quote with room-by-room calculation
        // This is a simplified example - in production, you'd extract detailed room measurements
        const rooms = [];
        let totalSqft = 0;
        
        // Simple room extraction (this would be more sophisticated in production)
        const roomMatch = message.match(/(\d+)\s*rooms?/i) || text.match(/(\d+)\s*rooms?/i);
        const roomCount = roomMatch ? parseInt(roomMatch[1]) : 1;
        
        // Extract room types if mentioned
        const roomTypes = [];
        if (message.toLowerCase().includes('kitchen')) roomTypes.push('Kitchen');
        if (message.toLowerCase().includes('bedroom')) roomTypes.push('Bedroom');
        if (message.toLowerCase().includes('bathroom')) roomTypes.push('Bathroom');
        if (message.toLowerCase().includes('living')) roomTypes.push('Living Room');
        if (message.toLowerCase().includes('dining')) roomTypes.push('Dining Room');
        
        // Create rooms based on count and types
        for (let i = 0; i < roomCount; i++) {
          // Get room type if available, otherwise generic name
          const roomType = i < roomTypes.length ? roomTypes[i] : `Room ${i+1}`;
          
          // Default room with estimated dimensions
          const wallLengths = [10, 12, 10, 12]; // Example 10x12 room
          const roomSqft = 2 * (wallLengths[0] + wallLengths[1]) * 8; // Perimeter * height
          
          rooms.push({
            name: roomType,
            wallLengths,
            ceilingHeight: 8,
            sqft: roomSqft,
            windowsCount: 1,
            doorsCount: 1,
            doorTypes: [{ type: 'Standard', count: 1, unitPrice: costs.door_trim_pricing?.door_unit_price || 45 }],
            baseboardLength: 2 * (wallLengths[0] + wallLengths[1]),
            ceilingIncluded: false,
            trimIncluded: true
          });
          
          totalSqft += roomSqft;
        }
        
        // Extract total square footage if mentioned
        const sqftMatch = message.match(/(\d+)\s*sq\s*ft/i) || message.match(/(\d+)\s*square\s*f(oo|ee)t/i);
        if (sqftMatch && sqftMatch[1]) {
          totalSqft = parseInt(sqftMatch[1]);
        }
        
        // We don't have detailed measurements in this example, so we'll store the rooms
        // In a real implementation, you'd extract wall lengths, door counts, etc.
        projectDetails = {
          rooms,
          totalSqft,
          paintQuality,
          coats,
          quoteMethod: 'advanced'
        };
        
        // Simplified baseCosts calculation
        const paintGallons = Math.ceil((totalSqft * coats) / (costs.default_spread_rate || 350));
        const paintCost = paintGallons * costs.paint_costs[paintQuality];
        
        // Apply the "2 rooms = 8 hours" rule
        const laborHours = (roomCount / 2) * 8;
        const laborCost = laborHours * costs.labor_cost_per_hour;
        
        // Calculate door costs
        const doorsMatch = message.match(/(\d+)\s*doors?/i) || text.match(/(\d+)\s*doors?/i);
        const doorCount = doorsMatch ? parseInt(doorsMatch[1]) : rooms.reduce((sum, room) => sum + room.doorsCount, 0);
        const doorCost = doorCount * (costs.door_trim_pricing?.door_unit_price || 45);
        
        // Calculate baseboard costs
        const totalBaseboardLength = rooms.reduce((sum, room) => sum + room.baseboardLength, 0);
        const baseboardCost = (costs.baseboard_pricing?.charge_method === 'linear_foot') 
          ? totalBaseboardLength * (costs.baseboard_pricing?.price_per_linear_foot || 2.5)
          : 0;
        
        baseCosts = {
          labor: laborCost,
          paint: paintCost,
          supplies: sundriesCost,
          doorTrimWork: doorCost,
          baseboards: baseboardCost
        };
      }
      
      // Calculate the total cost and final price
      const totalCost = Object.values(baseCosts).reduce((sum: number, val) => sum + (val || 0), 0);
      const finalPrice = totalCost * (1 + 0.20); // Default 20% markup for display
      
      // Store the calculation results
      responseData.conversationState = {
        ...conversationState,
        stage: 'quote_complete',
        quoteMethod,
        baseCosts,
        sundries: sundriesCost,
        projectDetails
      };
      
      // Replace placeholders in the response text with actual calculated values
      if (hasPlaceholders) {
        let updatedText = text;
        
        // Replace total cost placeholder
        updatedText = updatedText.replace(/\$\[total cost\]/g, formatCurrency(totalCost));
        
        // Replace price placeholder
        updatedText = updatedText.replace(/\$\[price\]/g, formatCurrency(finalPrice));
        
        // Update the response text
        responseData.response = updatedText;
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
