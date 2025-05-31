import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic behavior to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substr(2, 9)
  
  try {
    console.log(`[${timestamp}] [${requestId}] 🚀 Access code API called`)
    
    const { accessCode } = await request.json()
    console.log(`[${timestamp}] [${requestId}] 📝 Received access code: ${accessCode}`)

    if (!accessCode || typeof accessCode !== 'string') {
      console.log(`[${timestamp}] [${requestId}] ❌ Invalid access code format`)
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      )
    }

    console.log(`[${timestamp}] [${requestId}] 🔍 Creating Supabase client...`)
    const supabase = await createClient()
    console.log(`[${timestamp}] [${requestId}] ✅ Supabase client created`)

    console.log(`[${timestamp}] [${requestId}] 🔍 Looking for access code:`, accessCode.toUpperCase())

    // Check if access code exists and is valid
    console.log(`[${timestamp}] [${requestId}] 🔍 Querying database for access code...`)
    const queryStart = Date.now()
    
    const { data: accessCodeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', accessCode.toUpperCase())
      .eq('is_active', true)
      .single()

    const queryEnd = Date.now()
    console.log(`[${timestamp}] [${requestId}] ⏱️ Query took ${queryEnd - queryStart}ms`)
    console.log(`[${timestamp}] [${requestId}] 📊 Access code query result:`, { 
      found: !!accessCodeData, 
      error: codeError?.message || 'none',
      code: codeError?.code || 'none',
      details: codeError?.details || 'none'
    })
    
    if (accessCodeData) {
      console.log(`[${timestamp}] [${requestId}] ✅ Access code found:`, {
        id: accessCodeData.id,
        company_name: accessCodeData.company_name,
        is_active: accessCodeData.is_active,
        uses_count: accessCodeData.uses_count,
        max_uses: accessCodeData.max_uses,
        expires_at: accessCodeData.expires_at,
        created_at: accessCodeData.created_at
      })
    }

    if (codeError || !accessCodeData) {
      console.log(`[${timestamp}] [${requestId}] ❌ Access code validation failed:`, {
        hasError: !!codeError,
        hasData: !!accessCodeData,
        errorMessage: codeError?.message,
        errorCode: codeError?.code
      })
      return NextResponse.json(
        { 
          error: 'Invalid or expired access code',
          debug: {
            timestamp,
            requestId,
            queryTime: queryEnd - queryStart,
            hasError: !!codeError,
            errorCode: codeError?.code
          }
        },
        { status: 401 }
      )
    }

    // Check if code has expired
    console.log(`[${timestamp}] [${requestId}] 🕐 Checking expiration...`)
    if (accessCodeData.expires_at && new Date(accessCodeData.expires_at) < new Date()) {
      console.log(`[${timestamp}] [${requestId}] ⏰ Access code expired:`, {
        expires_at: accessCodeData.expires_at,
        current_time: new Date().toISOString()
      })
      return NextResponse.json(
        { error: 'Access code has expired' },
        { status: 401 }
      )
    }

    // Check if code has reached max uses
    console.log(`[${timestamp}] [${requestId}] 🔢 Checking usage limits...`)
    if (accessCodeData.max_uses && accessCodeData.uses_count >= accessCodeData.max_uses) {
      console.log(`[${timestamp}] [${requestId}] 🚫 Access code reached max uses:`, {
        uses_count: accessCodeData.uses_count,
        max_uses: accessCodeData.max_uses
      })
      return NextResponse.json(
        { error: 'Access code has reached maximum uses' },
        { status: 401 }
      )
    }
    
    console.log(`[${timestamp}] [${requestId}] ✅ All validations passed`)

    // Generate a simple session ID instead of using Supabase auth
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[${timestamp}] [${requestId}] 🆔 Generated session ID: ${sessionId}`)
    
    // Update access code usage count and last used timestamp
    console.log(`[${timestamp}] [${requestId}] 📝 Updating usage count...`)
    const updateStart = Date.now()
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({
        uses_count: accessCodeData.uses_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', accessCodeData.id)

    const updateEnd = Date.now()
    console.log(`[${timestamp}] [${requestId}] ⏱️ Update took ${updateEnd - updateStart}ms`)

    if (updateError) {
      console.log(`[${timestamp}] [${requestId}] ⚠️ Access code update error:`, updateError)
      // Don't fail the request for usage tracking errors
    } else {
      console.log(`[${timestamp}] [${requestId}] ✅ Usage count updated successfully`)
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

    const response = {
      success: true,
      companyName: accessCodeData.company_name,
      userId: sessionId,
      sessionToken: sessionId,
      debug: {
        timestamp,
        requestId,
        totalProcessingTime: Date.now() - new Date(timestamp).getTime()
      }
    }
    
    console.log(`[${timestamp}] [${requestId}] 🎉 Success! Returning response:`, response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Access code API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}