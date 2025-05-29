import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page and auth routes
        if (req.nextUrl.pathname.startsWith('/quotes/login') || 
            req.nextUrl.pathname.startsWith('/api/auth')) {
          return true
        }
        
        // Require authentication for all other routes under /quotes
        if (req.nextUrl.pathname.startsWith('/quotes')) {
          return !!token
        }
        
        // Allow other routes
        return true
      },
    },
    pages: {
      signIn: '/quotes/login',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
