import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

import { signIn } from '@/lib/auth/auth'
import { safeRedirectPath } from '@/lib/auth/redirect-target'
import { getRequestOrigin } from '@/lib/auth/request'

export async function GET(request: NextRequest) {
  const origin = await getRequestOrigin()

  // Read the auth_next cookie to determine where to redirect after OAuth completes
  const cookieStore = await cookies()
  const authNextCookie = cookieStore.get('auth_next')
  const redirectPath = authNextCookie
    ? safeRedirectPath(authNextCookie.value)
    : '/'
  const redirectTo = `${origin}${redirectPath}`

  // signIn() will redirect to the OIDC provider
  // This will throw NEXT_REDIRECT, which is normal for route handlers
  await signIn('oidc', {
    redirectTo
  })
}
