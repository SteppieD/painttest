import { NextRequest, NextResponse } from 'next/server'

// BYPASS ROUTE - No Supabase, no complex logic, just pure validation
export const dynamic = 'force-dynamic'

// Hardcoded access codes for bypass testing
const VALID_CODES = {
  'DEMO2024': {
    companyName: 'Demo Painting Company',
    id: 'bypass-demo-2024'
  }
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substr(2, 9)
  const serverId = process.env.RAILWAY_DEPLOYMENT_ID || process.env.HOSTNAME || 'bypass-server'
  
  console.log(`[BYPASS] [${timestamp}] [${requestId}] [${serverId}] 🚀 BYPASS API called`)
  
  try {
    const { accessCode } = await request.json()
    console.log(`[BYPASS] [${timestamp}] [${requestId}] Received code: ${accessCode}`)
    
    const upperCode = accessCode?.toUpperCase()
    
    if (upperCode && upperCode in VALID_CODES) {
      const sessionId = `bypass_${Date.now()}_${requestId}`
      const response = {
        success: true,
        companyName: VALID_CODES[upperCode as keyof typeof VALID_CODES].companyName,
        userId: sessionId,
        sessionToken: sessionId,
        bypass: true,
        debug: {
          timestamp,
          requestId,
          serverId,
          route: 'bypass'
        }
      }
      
      console.log(`[BYPASS] [${timestamp}] [${requestId}] 🎉 BYPASS SUCCESS:`, response)
      
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Bypass': 'true',
        'X-Server-ID': serverId,
        'X-Request-ID': requestId,
        'X-Timestamp': timestamp
      })
      
      return new NextResponse(JSON.stringify(response), { 
        status: 200, 
        headers 
      })
    } else {
      console.log(`[BYPASS] [${timestamp}] [${requestId}] Invalid code: ${upperCode}`)
      return NextResponse.json(
        { error: 'Invalid bypass code' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.log(`[BYPASS] [${timestamp}] [${requestId}] Error:`, error)
    return NextResponse.json(
      { error: 'Bypass API error' },
      { status: 500 }
    )
  }
}