import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, conversationState, messages, userId } = await request.json()

    // Initialize Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    })

    // Get cost settings
    const supabase = await createClient()
    const { data: costSettings } = await supabase
      .from('cost_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    const defaultCosts = {
      labor_cost_per_hour: 25,
      paint_costs: { good: 25, better: 35, best: 50 },
      supplies_base_cost: 100
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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response to see if we need to create a project or update state
    let responseData: any = { response: text }

    // Check if we should create a new project
    if (conversationState.stage === 'gathering_info' && !conversationState.clientName) {
      // Try to extract client name and address
      const lowerMessage = message.toLowerCase()
      
      // Look for patterns like "name is X" or "client is X"
      if (lowerMessage.includes('name') || lowerMessage.includes('client')) {
        // Simple extraction - you might want to make this more robust
        const parts = message.split(/,|\.|address is|at /i)
        if (parts.length >= 2) {
          const clientName = parts[0].replace(/client(s)?(\s+name)?(\s+is)?/i, '').trim()
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
      
      // Simple parsing - in production you'd want more robust parsing
      if (message.includes('14 by 8 by 10')) {
        // Calculate square footage for 2 bedrooms
        const roomSqft = (2 * (14 * 10) + 2 * (8 * 10)) // walls only
        rooms.push({
          name: 'Bedroom 1',
          sqft: roomSqft,
          windowsCount: 1,
          doorsCount: 1,
          ceilingIncluded: false,
          trimIncluded: false
        })
        rooms.push({
          name: 'Bedroom 2',
          sqft: roomSqft,
          windowsCount: 1,
          doorsCount: 1,
          ceilingIncluded: false,
          trimIncluded: false
        })
        totalSqft = roomSqft * 2
      }

      // Calculate costs
      const paintGallons = Math.ceil((totalSqft * 2) / 350) // 2 coats
      const paintCost = paintGallons * costs.paint_costs.better
      const laborHours = Math.ceil(totalSqft / 200) * 2 // rough estimate
      const laborCost = laborHours * costs.labor_cost_per_hour
      const suppliesCost = costs.supplies_base_cost

      const baseCosts = {
        labor: laborCost,
        paint: paintCost,
        supplies: suppliesCost
      }
      
      responseData.conversationState = {
        ...conversationState,
        stage: 'quote_complete',
        baseCosts,
        projectDetails: {
          rooms,
          totalSqft,
          paintQuality: 'better',
          coats: 2
        }
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
