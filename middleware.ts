import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/chat',
    '/insights', 
    '/settings',
    '/setup',
    '/quotes'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const companyId = request.cookies.get('companyId')?.value
    
    if (!companyId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname === '/login') {
    const companyId = request.cookies.get('companyId')?.value
    
    if (companyId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}