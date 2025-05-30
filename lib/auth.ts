import { db } from './database'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  companyId: string
  accessCode: string
  companyName: string
  isLoggedIn: boolean
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'painting-quote-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  return session
}

export async function generateAccessCode(): Promise<string> {
  let code: string
  let exists = true
  
  // Generate unique 6-digit code
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString()
    const existing = await db.company.findUnique({
      where: { accessCode: code }
    })
    exists = !!existing
  }
  
  return code!
}

export async function loginWithAccessCode(accessCode: string) {
  // Find or create company with this access code
  let company = await db.company.findUnique({
    where: { accessCode }
  })
  
  if (!company) {
    // Create new company with this access code
    company = await db.company.create({
      data: {
        accessCode,
        name: `Company ${accessCode}`,
        settings: {
          laborRate: 50,
          markup: 20,
          taxRate: 8.5
        }
      }
    })
  } else {
    // Update last used timestamp
    await db.company.update({
      where: { id: company.id },
      data: { lastUsed: new Date() }
    })
  }
  
  // Create session
  const session = await getSession()
  session.companyId = company.id
  session.accessCode = company.accessCode
  session.companyName = company.name
  session.isLoggedIn = true
  await session.save()
  
  return company
}

export async function logout() {
  const session = await getSession()
  session.destroy()
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session.isLoggedIn || !session.companyId) {
    return null
  }
  
  // Verify company still exists
  const company = await db.company.findUnique({
    where: { id: session.companyId }
  })
  
  if (!company) {
    await logout()
    return null
  }
  
  return {
    session,
    company
  }
}

export async function getCurrentCompany() {
  const auth = await requireAuth()
  return auth?.company || null
}