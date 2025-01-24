import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  // Get viewMode from localStorage on client side
  const viewMode = request.cookies.get('viewMode')?.value || 'coach'
  const path = request.nextUrl.pathname

  // Redirect based on view mode
  if (viewMode === 'athlete' && path.startsWith('/coach')) {
    return NextResponse.redirect(new URL('/athlete/workouts', request.url))
  }

  if (viewMode === 'coach' && path.startsWith('/athlete')) {
    return NextResponse.redirect(new URL('/coach/exercises', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}