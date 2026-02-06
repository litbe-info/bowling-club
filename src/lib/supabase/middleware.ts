import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session - this is the main purpose of the middleware
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  // /login or /register - if already logged in, redirect based on role
  if (isPublicRoute) {
    if (user) {
      const role = await getUserRole(supabase, user.id)
      if (role === 'member') {
        const status = await getMemberApprovalStatus(supabase, user.id)
        if (status === 'pending') {
          return NextResponse.redirect(new URL('/pending-approval', request.url))
        }
        return NextResponse.redirect(new URL('/profile', request.url))
      }
      return NextResponse.redirect(
        new URL(role === 'receptionist' ? '/scan' : '/dashboard', request.url)
      )
    }
    return supabaseResponse
  }

  // Pending approval page - requires auth but only for pending members
  if (pathname === '/pending-approval') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // All other routes require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Define route groups
  const adminRoutes = ['/dashboard', '/members', '/qr-codes', '/campaigns']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isReceptionistRoute = pathname.startsWith('/scan')
  const isMemberRoute = pathname.startsWith('/profile')

  if (pathname === '/' || isAdminRoute || isReceptionistRoute || isMemberRoute) {
    const role = await getUserRole(supabase, user.id)

    // Root - redirect based on role
    if (pathname === '/') {
      if (role === 'member') {
        const status = await getMemberApprovalStatus(supabase, user.id)
        if (status === 'pending') {
          return NextResponse.redirect(new URL('/pending-approval', request.url))
        }
        return NextResponse.redirect(new URL('/profile', request.url))
      }
      return NextResponse.redirect(
        new URL(role === 'receptionist' ? '/scan' : '/dashboard', request.url)
      )
    }

    // Member trying to access admin/receptionist routes
    if (role === 'member') {
      if (isAdminRoute || isReceptionistRoute) {
        const status = await getMemberApprovalStatus(supabase, user.id)
        if (status === 'pending') {
          return NextResponse.redirect(new URL('/pending-approval', request.url))
        }
        return NextResponse.redirect(new URL('/profile', request.url))
      }
      // Member accessing member routes - check approval
      if (isMemberRoute) {
        const status = await getMemberApprovalStatus(supabase, user.id)
        if (status === 'pending') {
          return NextResponse.redirect(new URL('/pending-approval', request.url))
        }
      }
    }

    // Receptionist trying to access admin routes
    if (isAdminRoute && role === 'receptionist') {
      return NextResponse.redirect(new URL('/scan', request.url))
    }

    // Admin trying to access receptionist routes
    if (isReceptionistRoute && role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Non-member trying to access member routes
    if (isMemberRoute && role !== 'member') {
      return NextResponse.redirect(
        new URL(role === 'receptionist' ? '/scan' : '/dashboard', request.url)
      )
    }
  }

  return supabaseResponse
}

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()
  return data?.role || null
}

async function getMemberApprovalStatus(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('club_members')
    .select('approval_status')
    .eq('user_id', userId)
    .single()
  return data?.approval_status || null
}
