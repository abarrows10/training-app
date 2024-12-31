import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporarily allow all access
export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}