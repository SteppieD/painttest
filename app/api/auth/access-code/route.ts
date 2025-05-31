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

    // Check if access code exists and is valid
    const { data: accessCodeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', accessCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (codeError || !accessCodeData) {
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

    // Create a demo user account or sign them in
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          access_code_id: accessCodeData.id,
          company_name: accessCodeData.company_name,
          is_demo: true
        }
      }
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create demo session' },
        { status: 500 }
      )
    }

    // Create or update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        company_name: accessCodeData.company_name,
        phone: accessCodeData.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Don't fail the request for profile errors
    }

    // Create default cost settings
    const { error: costError } = await supabase
      .from('cost_settings')
      .upsert({
        user_id: authData.user.id,
        labor_cost_per_hour: 25,
        paint_costs: { good: 25, better: 35, best: 50 },
        supplies_base_cost: 100,
        company_name: accessCodeData.company_name,
        contact_name: accessCodeData.contact_name,
        default_labor_percentage: 30,
        default_spread_rate: 350,
        door_trim_pricing: { door_unit_price: 45, trim_linear_foot_price: 3 },
        baseboard_pricing: { charge_method: 'linear_foot', price_per_linear_foot: 2.5 },
        default_rates: { walls: 3.00, ceilings: 2.00, trim_doors: 5.00 },
        default_paint_costs: { walls: 26, ceilings: 25, trim_doors: 35 },
        updated_at: new Date().toISOString()
      })

    if (costError) {
      console.error('Cost settings error:', costError)
      // Don't fail the request for cost settings errors
    }

    // Record the access code session
    const { error: sessionError } = await supabase
      .from('access_code_sessions')
      .insert({
        access_code_id: accessCodeData.id,
        user_id: authData.user.id,
        session_data: {
          user_agent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        }
      })

    if (sessionError) {
      console.error('Session recording error:', sessionError)
      // Don't fail the request for session recording errors
    }

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

    return NextResponse.json({
      success: true,
      companyName: accessCodeData.company_name,
      userId: authData.user.id
    })

  } catch (error) {
    console.error('Access code API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}