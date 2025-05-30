import { db } from '@/lib/database'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    // Update quote status to accepted
    const quote = await db.quote.update({
      where: { id: params.quoteId },
      data: { 
        status: 'accepted',
        acceptedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Quote accepted successfully',
      quote 
    })

  } catch (error) {
    console.error('Error accepting quote:', error)
    return NextResponse.json(
      { error: 'Failed to accept quote' },
      { status: 500 }
    )
  }
}