import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()
  
  try {
    console.log(`[${timestamp}] 🏥 Health check started`)
    
    // Test Supabase connection
    const supabase = await createClient()
    
    // Test database query
    const queryStart = Date.now()
    const { data, error } = await supabase
      .from('access_codes')
      .select('id, code, is_active')
      .eq('code', 'DEMO2024')
      .single()
    
    const queryTime = Date.now() - queryStart
    
    const health = {
      status: 'ok',
      timestamp,
      checks: {
        supabase_connection: !!supabase ? 'ok' : 'failed',
        database_query: !error ? 'ok' : 'failed',
        demo_code_exists: !!data ? 'ok' : 'failed',
        query_time_ms: queryTime
      },
      demo_code_info: data ? {
        id: data.id,
        is_active: data.is_active
      } : null,
      error: error?.message || null
    }
    
    console.log(`[${timestamp}] 🏥 Health check result:`, health)
    
    return NextResponse.json(health)
  } catch (error: any) {
    console.error(`[${timestamp}] 🏥 Health check failed:`, error)
    
    return NextResponse.json({
      status: 'error',
      timestamp,
      error: error.message,
      checks: {
        supabase_connection: 'failed',
        database_query: 'failed',
        demo_code_exists: 'failed'
      }
    }, { status: 500 })
  }
}