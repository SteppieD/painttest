import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all access codes
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: accessCodes, error } = await supabase
      .from('access_codes')
      .select(`
        *,
        access_code_sessions (
          id,
          user_id,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ accessCodes })
  } catch (error) {
    console.error('Error fetching access codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access codes' },
      { status: 500 }
    )
  }
}

// POST - Create a new access code
export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      companyName, 
      contactName,
      phone,
      maxUses,
      expiresAt,
      notes 
    } = await request.json()

    if (!code || !companyName) {
      return NextResponse.json(
        { error: 'Code and company name are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: accessCode, error } = await supabase
      .from('access_codes')
      .insert({
        code: code.toUpperCase(),
        company_name: companyName,
        contact_name: contactName,
        phone,
        max_uses: maxUses || null,
        expires_at: expiresAt || null,
        created_by: 'admin', // You could track who created it
        notes
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Access code already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ accessCode })
  } catch (error) {
    console.error('Error creating access code:', error)
    return NextResponse.json(
      { error: 'Failed to create access code' },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate an access code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const codeId = searchParams.get('id')

    if (!codeId) {
      return NextResponse.json(
        { error: 'Access code ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: false })
      .eq('id', codeId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating access code:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate access code' },
      { status: 500 }
    )
  }
}