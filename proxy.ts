import { type NextRequest, NextResponse } from 'next/server'


export async function proxy(request: NextRequest) {
  // Get the protocol from X-Forwarded-Proto header or request protocol
  const protocol =
    request.headers.get('x-forwarded-proto') || request.nextUrl.protocol

  // Get the host from X-Forwarded-Host header or request host
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || ''

  // Construct the base URL - ensure protocol has :// format
  const baseUrl = `${protocol}${protocol.endsWith(':') ? '//' : '://'}${host}`

  // Authentication is resolved server-side (Auth.js JWT cookie), so the
  // proxy only passes the request through and annotates it.
  const response = NextResponse.next({
    request
  })

  // Add request information to response headers
  response.headers.set('x-url', request.url)
  response.headers.set('x-host', host)
  response.headers.set('x-protocol', protocol)
  response.headers.set('x-base-url', baseUrl)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/favicon (source favicon images, which need no session)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
