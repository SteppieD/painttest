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

    const prompt = `You are an efficient AI assistant for a painting contractor. You CALCULATE things automatically and make reasonable assumptions rather than asking excessive questions.

Conversation history:
${conversationHistory}
User: ${message}

Painting costs: Labor $${costs.labor_cost_per_hour}/hour, Good paint $${costs.paint_costs.good}/gal, Better paint $${costs.paint_costs.better}/gal, Best paint $${costs.paint_costs.best}/gal, Supplies base cost: $${costs.supplies_base_cost}

RULES:
1. Be efficient - CALCULATE automatically using standard assumptions:
   - 400 sqft per gallon coverage
   - 8 hours labor per 400 sqft
   - Most jobs need 2 coats
2. Only ask for ESSENTIAL info: client name, email, phone, property address, room size/description, paint quality preference
3. When you have basics, say "READY_FOR_QUOTE" followed by:
{
  "clientName": "[name]",
  "propertyAddress": "[address]",
  "clientEmail": "[email]",
  "clientPhone": "[phone]",
  "rooms": [{"name": "[room]", "sqft": [number], "coats": 2}],
  "totalSqft": [number],
  "paintQuality": "better"
}
4. Be professional but friendly
5. Keep responses under 2 sentences

Respond:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Always return the AI response
    let responseData: any = { 
      response: text,
      stage: conversationState.stage || 'gathering_info'
    }

    console.log('AI Response:', text)

    // Basic project creation logic
    if (!conversationState.projectId && message.toLowerCase().includes('name')) {
      try {
        // Very simple name extraction - can be improved later
        const parts = message.split(/,|\s+at\s+/i)
        if (parts.length >= 2) {
          const clientName = parts[0].replace(/.*name\s+is\s+/i, '').trim()
          const propertyAddress = parts[1].trim()
          
          const { data: project } = await supabase
            .from('projects')
            .insert({
              user_id: userId,
              client_name: clientName,
              property_address: propertyAddress,
              client_email: null,
              client_phone: null,
              preferred_contact: 'email'
            })
            .select()
            .single()

          if (project) {
            responseData.projectId = project.id
            responseData.clientInfo = { name: clientName, address: propertyAddress, email: null, phone: null }
          }
        }
      } catch (error) {
        console.error('Project creation error:', error)
      }
    }

    // Check if AI is ready to create quote
    if (text.includes('READY_FOR_QUOTE')) {
      try {
        // Extract JSON from the response
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonStr = text.substring(jsonStart, jsonEnd);
        const projectData = JSON.parse(jsonStr);
        
        // Create project if needed
        if (!conversationState.projectId && projectData.clientName) {
          const { data: project } = await supabase
            .from('projects')
            .insert({
              user_id: userId,
              client_name: projectData.clientName,
              property_address: projectData.propertyAddress,
              client_email: projectData.clientEmail || null,
              client_phone: projectData.clientPhone || null,
              preferred_contact: projectData.clientEmail ? 'email' : 'phone'
            })
            .select()
            .single()

          if (project) {
            responseData.projectId = project.id
            responseData.clientInfo = { 
              name: projectData.clientName, 
              address: projectData.propertyAddress,
              email: projectData.clientEmail,
              phone: projectData.clientPhone
            }
          }
        }

        // Calculate painting costs based on extracted data
        const totalSqft = projectData.totalSqft || 0
        const paintQuality = projectData.paintQuality || 'better'
        
        // Estimate painting costs
        const laborHours = Math.ceil((totalSqft / 400) * 8) // 8 hours per 400 sqft
        const paintGallons = Math.ceil(totalSqft / 400)
        const paintCostPerGallon = costs.paint_costs[paintQuality as keyof typeof costs.paint_costs] || costs.paint_costs.better
        
        const laborCost = laborHours * costs.labor_cost_per_hour
        const paintCost = paintGallons * paintCostPerGallon
        const suppliesCost = costs.supplies_base_cost

        const baseCosts = {
          labor: laborCost,
          paint: paintCost,
          supplies: suppliesCost
        }
        
        responseData.stage = 'calculating_quote'
        responseData.baseCosts = baseCosts
        responseData.metadata = {
          stage: 'calculating_quote',
          baseCosts,
          projectDetails: {
            ...projectData,
            rooms: projectData.rooms || [],
            totalSqft: totalSqft,
            paintQuality: paintQuality,
            laborHours: laborHours
          }
        }
        
        // Replace the AI response with a user-friendly message
        responseData.response = `Perfect! Here's your painting quote:

• ${totalSqft} sqft total area
• ${paintQuality} quality paint
• ${laborHours} hours estimated labor

Base costs: Labor $${laborCost}, Paint $${paintCost}, Supplies $${suppliesCost}
Total base cost: $${(laborCost + paintCost + suppliesCost).toFixed(0)}

Select your markup percentage to finalize the quote!`
        
      } catch (error) {
        console.error('Error parsing project data:', error)
        responseData.response = "Let me gather the basic details. What's the client name and property address?"
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
