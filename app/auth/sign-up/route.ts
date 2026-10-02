import { NextResponse } from 'next/server'

// Accounts are created in the identity provider; sign-up == sign-in.
export function GET(request: Request) {
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
