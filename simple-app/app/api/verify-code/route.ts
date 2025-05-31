import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    console.log('🔍 Received access code:', code)
    
    // Simple validation - accept DEMO2024
    if (code === 'DEMO2024') {
      console.log('✅ Access code valid!')
      return NextResponse.json({
        success: true,
        message: 'Access granted!'
      })
    } else {
      console.log('❌ Invalid access code:', code)
      return NextResponse.json(
        { error: 'Invalid access code. Try DEMO2024' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}