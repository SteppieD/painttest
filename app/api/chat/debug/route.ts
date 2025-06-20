import { getSessionWithCompany } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const auth = await getSessionWithCompany()
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    message: 'Debug endpoint - auth working',
    company: auth.company.name
  })
}