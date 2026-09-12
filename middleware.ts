import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for login pages to avoid redirect loops
  if (req.nextUrl.pathname.includes('/login')) {
    return res
  }
  
  // Get session from cookies
  const accessToken = req.cookies.get('sb-access-token')?.value
  const refreshToken = req.cookies.get('sb-refresh-token')?.value

  let session = null
  if (accessToken && refreshToken) {
    try {
      const { data: { session: sessionData } } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      session = sessionData
    } catch (error) {
      console.error('Session validation error:', error)
    }
  }

  // Protect profile page
  if (req.nextUrl.pathname.startsWith('/profile')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.includes('/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    // Check if user has admin role
    const userRole = session.user.user_metadata.role
    if (userRole !== 'admin') {
      console.error('User role check failed:', userRole)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect restaurant routes
  if (req.nextUrl.pathname.startsWith('/restaurant') && !req.nextUrl.pathname.includes('/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/restaurant/login', req.url))
    }
    const userRole = session.user.user_metadata.role
    if (userRole !== 'restaurant') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect delivery routes
  if (req.nextUrl.pathname.startsWith('/delivery') && !req.nextUrl.pathname.includes('/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/delivery/login', req.url))
    }
    const userRole = session.user.user_metadata.role
    if (userRole !== 'delivery') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*', '/restaurant/:path*', '/delivery/:path*']
}