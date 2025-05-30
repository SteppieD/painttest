import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSessionWithCompany } from '@/lib/auth'
import { db } from '@/lib/database'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, conversationState, messages, projectId } = await request.json()

    const auth = await getSessionWithCompany()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { company } = auth

    // For now, return a simple response
    // TODO: Implement full chat functionality
    return NextResponse.json({
      response: "Chat functionality will be restored soon. Please use the simple quote form for now.",
      conversationState: conversationState || {}
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}