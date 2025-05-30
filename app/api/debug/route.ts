import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Test database connection
    await db.$connect()
    
    // Check if tables exist by trying to count companies
    const companyCount = await db.company.count()
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      companyCount,
      message: 'Database is working correctly'
    })
  } catch (error: any) {
    console.error('Database error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      message: 'Database connection failed'
    }, { status: 500 })
  }
}