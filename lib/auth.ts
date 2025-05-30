import { db } from './database'
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const companyId = cookieStore.get('companyId')?.value
  
  if (!companyId) {
    return { isLoggedIn: false, companyId: null }
  }
  
  return { isLoggedIn: true, companyId }
}

export async function getSessionWithCompany() {
  const session = await getSession()
  
  if (!session.isLoggedIn || !session.companyId) {
    return null
  }
  
  const company = await db.company.findUnique({
    where: { id: session.companyId }
  })
  
  if (!company) {
    return null
  }
  
  return { session, company }
}

export async function setSession(companyId: string) {
  const cookieStore = await cookies()
  cookieStore.set('companyId', companyId, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('companyId')
}

export async function generateAccessCode(): Promise<string> {
  // Generate a simple 6-character alphanumeric access code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
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
  
  await setSession(company.id)
  return company
}