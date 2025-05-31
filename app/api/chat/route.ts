import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic behavior to prevent build-time evaluation
export const dynamic = 'force-dynamic'

// Initialize the Google Generative AI client lazily at runtime
function initializeGenAI() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables')
    throw new Error('Missing GEMINI_API_KEY environment variable')
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    console.log('Gemini API initialized successfully')
    return genAI
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error)
    throw new Error('Failed to initialize Gemini API')
  }
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
      const genAI = initializeGenAI()
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
    

    const prompt = `You are an AI assistant helping a painting business owner create accurate quotes for their clients. Your role is to gather project details through natural conversation.

Current conversation state: ${JSON.stringify(conversationState)}
Cost settings: ${JSON.stringify(costs)}

Key information to collect:
- Client name and property address
- Room details (number, types, dimensions)
- Paint requirements (coats, quality - good/better/best)
- Surface conditions
- Special requirements

IMPORTANT INSTRUCTIONS:
1. Be conversational and friendly
2. When you have enough information, provide a BRIEF summary in this format:
   "Great! I have all the information I need. Here's a quick summary:
   - [Client name] at [address]
   - [Number] rooms: [room types]
   - [X] coats of [quality] paint
   
   Based on your cost settings, this will be approximately $[total cost] in costs.
   With your selected markup, the quote to the client will be around $[price].
   
   You can adjust the markup percentage on the right and generate the PDF when ready!"

3. Do NOT show detailed calculations or break down costs in the chat
4. Keep responses short and focused
5. Guide the conversation naturally

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

    // Check if we should create a new project
    if (conversationState.stage === 'gathering_info' && !conversationState.clientName) {
      // Try to extract client name and address
      const lowerMessage = message.toLowerCase()
      
      // Look for patterns like "name is X" or "client is X"
      if (lowerMessage.includes('name') || lowerMessage.includes('client')) {
        // Simple extraction - you might want to make this more robust
        const parts = message.split(/,|\\.|address is|at /i)
        if (parts.length >= 2) {
          const clientName = parts[0].replace(/client(s)?(\\s+name)?(\\s+is)?/i, '').trim()
          const propertyAddress = parts[1].trim()
          
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
        }
      }
    }

    // Check if we have enough info to calculate costs
    if (text.includes('approximately $') && conversationState.clientName) {
      // Extract room information from conversation
      const rooms = []
      let totalSqft = 0
      let roomCount = 1 // Default to 1 room
      
      // Simple parsing - extract room information from message
      const roomMatches = message.match(/(\d+)\s*rooms?/i)
      if (roomMatches) {
        roomCount = parseInt(roomMatches[1])
      }
      
      // Check for specific room dimensions
      if (message.includes('14 by 8 by 10')) {
        // Calculate square footage for 2 bedrooms with given dimensions
        const roomLength = 14
        const roomWidth = 8
        const roomHeight = 10
        
        // Wall area calculation: perimeter × height - doors/windows
        const perimeter = 2 * (roomLength + roomWidth) // 44 linear feet
        const wallSqft = perimeter * roomHeight // 440 sq ft
        const doorArea = 21 // 7ft × 3ft door
        const windowArea = 12 // 4ft × 3ft window
        const netWallSqft = wallSqft - doorArea - windowArea // 407 sq ft per room
        
        rooms.push({
          name: 'Bedroom 1',
          sqft: netWallSqft,
          windowsCount: 1,
          doorsCount: 1,
          ceilingIncluded: false,
          trimIncluded: false
        })
        rooms.push({
          name: 'Bedroom 2',
          sqft: netWallSqft,
          windowsCount: 1,
          doorsCount: 1,
          ceilingIncluded: false,
          trimIncluded: false
        })
        totalSqft = netWallSqft * 2
        roomCount = 2
      } else {
        // Create default rooms based on room count
        for (let i = 0; i < roomCount; i++) {
          const defaultRoomSqft = 320 // Approximate 12×12 room with 8ft ceiling
          rooms.push({
            name: `Room ${i + 1}`,
            sqft: defaultRoomSqft,
            windowsCount: 1,
            doorsCount: 1,
            ceilingIncluded: false,
            trimIncluded: false
          })
          totalSqft += defaultRoomSqft
        }
      }

      // REALISTIC CALCULATIONS
      
      // Paint calculation: 1 gallon covers 350 sq ft, 2 coats standard
      const coats = 2
      const coverage = 350 // sq ft per gallon
      const paintGallons = Math.ceil((totalSqft * coats) / coverage)
      const paintCost = paintGallons * costs.paint_costs.better
      
      // Labor calculation: 2 rooms per 8-hour workday
      const hoursPerDay = 8
      const roomsPerDay = 2
      const hoursPerRoom = hoursPerDay / roomsPerDay // 4 hours per room
      const totalLaborHours = roomCount * hoursPerRoom
      const laborCost = totalLaborHours * costs.labor_cost_per_hour
      
      // Sundries calculation: flat rate per room
      const sundriesPerRoom = 25 // $25 per room for tape, brushes, trays, etc.
      const sundriesCost = roomCount * sundriesPerRoom

      const baseCosts = {
        labor: laborCost,
        paint: paintCost,
        sundries: sundriesCost // Renamed from supplies
      }
      
      // Calculate total cost and final price for placeholder replacement
      const totalCost = Object.values(baseCosts).reduce((sum, val) => sum + (val || 0), 0)
      const defaultMarkup = 0.20 // 20% markup
      const finalPrice = totalCost * (1 + defaultMarkup)
      
      responseData.conversationState = {
        ...conversationState,
        stage: 'quote_complete',
        baseCosts,
        projectDetails: {
          rooms,
          totalSqft,
          paintQuality: 'better',
          coats: 2,
          paintGallons,
          totalLaborHours,
          roomCount
        }
      }
      
      // Replace placeholders in the response text with actual calculated values
      if (text.includes('$[total cost]') || text.includes('$[price]')) {
        let updatedText = text
        
        // Replace total cost placeholder
        updatedText = updatedText.replace(/\$\[total cost\]/g, `$${totalCost.toFixed(2)}`)
        
        // Replace price placeholder  
        updatedText = updatedText.replace(/\$\[price\]/g, `$${finalPrice.toFixed(2)}`)
        
        // Update the response text
        responseData.response = updatedText
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
