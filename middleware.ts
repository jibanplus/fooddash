import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for login pages to avoid redirect loops
  if (req.nextUrl.pathname.includes('/login')) {
    return res
  }
  
  // Skip middleware for debug page
  if (req.nextUrl.pathname.includes('/debug-auth')) {
    return res
  }
  
  console.log('Middleware - Path:', req.nextUrl.pathname)
  
  // Create a fresh Supabase client for each request
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
  
  // Get session using getUser() which is more reliable in middleware
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('Middleware - User exists:', !!user)
  console.log('Middleware - User error:', userError?.message)
  
  if (userError || !user) {
    console.log('Middleware - No valid user, checking protected routes')
    
    // Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.includes('/login')) {
      console.log('Middleware - Redirecting to admin login (no user)')
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    
    // Protect restaurant routes
    if (req.nextUrl.pathname.startsWith('/restaurant') && !req.nextUrl.pathname.includes('/login')) {
      console.log('Middleware - Redirecting to restaurant login (no user)')
      return NextResponse.redirect(new URL('/restaurant/login', req.url))
    }
    
    // Protect delivery routes
    if (req.nextUrl.pathname.startsWith('/delivery') && !req.nextUrl.pathname.includes('/login')) {
      console.log('Middleware - Redirecting to delivery login (no user)')
      return NextResponse.redirect(new URL('/delivery/login', req.url))
    }
    
    // Protect profile page
    if (req.nextUrl.pathname.startsWith('/profile')) {
      console.log('Middleware - Redirecting to login (no user)')
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    return res
  }
  
  console.log('Middleware - User authenticated:', user.email)
  console.log('Middleware - User role:', user.user_metadata.role)
  
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.includes('/login')) {
    console.log('Middleware - Checking admin route access')
    const userRole = user.user_metadata.role
    if (userRole !== 'admin') {
      console.error('User role check failed for admin route:', userRole)
      return NextResponse.redirect(new URL('/', req.url))
    }
    console.log('Middleware - Admin access granted')
  }

  // Protect restaurant routes
  if (req.nextUrl.pathname.startsWith('/restaurant') && !req.nextUrl.pathname.includes('/login')) {
    console.log('Middleware - Checking restaurant route access')
    const userRole = user.user_metadata.role
    if (userRole !== 'restaurant') {
      console.error('User role check failed for restaurant route:', userRole)
      return NextResponse.redirect(new URL('/', req.url))
    }
    console.log('Middleware - Restaurant access granted')
  }

  // Protect delivery routes
  if (req.nextUrl.pathname.startsWith('/delivery') && !req.nextUrl.pathname.includes('/login')) {
    console.log('Middleware - Checking delivery route access')
    const userRole = user.user_metadata.role
    if (userRole !== 'delivery') {
      console.error('User role check failed for delivery route:', userRole)
      return NextResponse.redirect(new URL('/', req.url))
    }
    console.log('Middleware - Delivery access granted')
  }

  return res
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*', '/restaurant/:path*', '/delivery/:path*']
}