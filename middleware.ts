import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Login sahifasiga kirish
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Protected routes uchun
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/menegerlar') ||
      pathname.startsWith('/adminlar') ||
      pathname.startsWith('/ustozlar') ||
      pathname.startsWith('/studentlar') ||
      pathname.startsWith('/guruhlar') ||
      pathname.startsWith('/kurslar') ||
      pathname.startsWith('/payment') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/sozlamalar')) {
    
    // Token yo'q bo'lsa, login ga yo'naltirish
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/menegerlar/:path*',
    '/adminlar/:path*',
    '/ustozlar/:path*',
    '/studentlar/:path*',
    '/guruhlar/:path*',
    '/kurslar/:path*',
    '/payment/:path*',
    '/profile/:path*',
    '/sozlamalar/:path*',
  ],
}
