import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic behavior to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { accessCode } = await request.json()

    if (!accessCode || typeof accessCode !== 'string') {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    console.log('Looking for access code:', accessCode.toUpperCase())

    // Check if access code exists and is valid
    const { data: accessCodeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', accessCode.toUpperCase())
      .eq('is_active', true)
      .single()

    console.log('Access code query result:', { accessCodeData, codeError })

    if (codeError || !accessCodeData) {
      console.log('Access code not found or error:', codeError)
      return NextResponse.json(
        { error: 'Invalid or expired access code' },
        { status: 401 }
      )
    }

    // Check if code has expired
    if (accessCodeData.expires_at && new Date(accessCodeData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Access code has expired' },
        { status: 401 }
      )
    }

    // Check if code has reached max uses
    if (accessCodeData.max_uses && accessCodeData.uses_count >= accessCodeData.max_uses) {
      return NextResponse.json(
        { error: 'Access code has reached maximum uses' },
        { status: 401 }
      )
    }

    // Generate a simple session ID instead of using Supabase auth
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Update access code usage count and last used timestamp
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({
        uses_count: accessCodeData.uses_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', accessCodeData.id)

    if (updateError) {
      console.error('Access code update error:', updateError)
      // Don't fail the request for usage tracking errors
    }

    // Record the access code session (optional)
    try {
      await supabase
        .from('access_code_sessions')
        .insert({
          access_code_id: accessCodeData.id,
          user_id: sessionId,
          session_data: {
            user_agent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          }
        })
    } catch (sessionError) {
      console.error('Session recording error:', sessionError)
      // Don't fail the request for session recording errors
    }

    return NextResponse.json({
      success: true,
      companyName: accessCodeData.company_name,
      userId: sessionId,
      sessionToken: sessionId
    })

  } catch (error) {
    console.error('Access code API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}