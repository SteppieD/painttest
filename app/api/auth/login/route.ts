import { NextRequest, NextResponse } from 'next/server'
import { loginWithAccessCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { accessCode } = await request.json()

    if (!accessCode || accessCode.length !== 6) {
      return NextResponse.json(
        { error: 'Access code must be 6 digits' },
        { status: 400 }
      )
    }

    const company = await loginWithAccessCode(accessCode)

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        accessCode: company.accessCode
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        error: 'Login failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}