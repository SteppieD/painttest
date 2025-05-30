import { NextResponse } from 'next/server'
import { generateAccessCode } from '@/lib/auth'

export async function POST() {
  try {
    const accessCode = await generateAccessCode()
    
    return NextResponse.json({
      accessCode
    })
  } catch (error) {
    console.error('Generate code error:', error)
    return NextResponse.json(
      { error: 'Failed to generate access code' },
      { status: 500 }
    )
  }
}