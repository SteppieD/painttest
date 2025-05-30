import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedRoutes = [
    '/quotes/dashboard',
    '/quotes/chat',
    '/quotes/insights', 
    '/quotes/settings',
    '/quotes/setup'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    try {
      const session = await getSession()
      
      if (!session.isLoggedIn || !session.companyId) {
        return NextResponse.redirect(new URL('/quotes/login', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/quotes/login', request.url))
    }
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname === '/quotes/login') {
    try {
      const session = await getSession()
      
      if (session.isLoggedIn && session.companyId) {
        return NextResponse.redirect(new URL('/quotes/dashboard', request.url))
      }
    } catch (error) {
      // Continue to login page if session check fails
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}