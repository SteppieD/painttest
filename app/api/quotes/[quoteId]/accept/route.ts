import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    const supabase = await createClient()
    
    // Update quote status to accepted
    const { data: quote, error } = await supabase
      .from('quotes')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', params.quoteId)
      .select('*, project:projects(client_name, client_email)')
      .single()

    if (error) {
      console.error('Error accepting quote:', error)
      return NextResponse.json(
        { error: 'Failed to accept quote' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to contractor
    // For now, we'll just return success

    return NextResponse.json({ 
      success: true, 
      message: 'Quote accepted successfully',
      quote 
    })
  } catch (error) {
    console.error('Quote acceptance error:', error)
    return NextResponse.json(
      { error: 'Failed to process quote acceptance' },
      { status: 500 }
    )
  }
}