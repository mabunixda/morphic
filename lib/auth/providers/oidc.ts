import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { auth, oidcConfigured, signIn, signOut } from '@/lib/auth/auth'
import { safeRedirectPath } from '@/lib/auth/redirect-target'
import { getRequestOrigin } from '@/lib/auth/request'
import type { AppUser, AuthActionResult, AuthProvider } from '@/lib/auth/types'

/**
 * OpenID Connect authentication provider (Authentik, Keycloak, Zitadel, etc.).
 *
 * Uses NextAuth.js with stateless JWT sessions. The OIDC `sub` claim becomes
 * the Morphic user ID (users.user_id is varchar(255) to accommodate OIDC subjects).
 *
 * Configuration:
 * - OIDC_ISSUER: Your identity provider's issuer URL
 * - OIDC_CLIENT_ID: OAuth client ID
 * - OIDC_CLIENT_SECRET: OAuth client secret
 * - OIDC_PROVIDER_NAME: Display name for the provider (default: "SSO")
 * - OIDC_SCOPE: OAuth scopes (default: "openid profile email")
 */
export const oidcAuthProvider: AuthProvider = {
  name: 'oidc',
  capabilities: {
    signUp: false, // Registration happens in the OIDC provider
    passwordReset: false, // Password management happens in the OIDC provider
    deleteUser: false, // User deletion happens in the OIDC provider
    oauth: true, // OIDC is OAuth-based
    emailVerification: false, // Email verification happens in the OIDC provider
    share: true // Sharing is supported with OIDC users
  },

  async getCurrentUser(): Promise<AppUser | null> {
    if (!oidcConfigured()) {
      return null // OIDC is not configured
    }

    const session = await auth()
    const user = session?.user
    if (!user?.id) {
      return null
    }

    return {
      id: user.id,
      email: user.email ?? null,
      name: user.name ?? null,
      image: user.image ?? null,
      createdAt: null // NextAuth.js JWT sessions don't track account creation time
    }
  },

  async handleSession(request: NextRequest): Promise<NextResponse> {
    // NextAuth.js handles session management automatically via its middleware
    // and the /api/auth/[...nextauth] route handlers. No additional session
    // handling is needed here.
    return NextResponse.next({ request })
  },

  async signInWithOAuth(provider: string): Promise<AuthActionResult> {
    // OIDC provider only supports the configured OIDC provider
    if (provider !== 'oidc') {
      return {
        success: false,
        error: `Unsupported OAuth provider: ${provider}`
      }
    }

    const origin = await getRequestOrigin()
    
    // Read the auth_next cookie to determine where to redirect after OAuth completes
    const cookieStore = await cookies()
    const authNextCookie = cookieStore.get('auth_next')
    const redirectPath = authNextCookie
      ? safeRedirectPath(authNextCookie.value)
      : '/'
    const redirectTo = `${origin}${redirectPath}`
    
    // signIn() from NextAuth throws NEXT_REDIRECT to trigger the OAuth flow.
    // We must let this error propagate - don't catch it.
    // The redirect will happen automatically via Next.js Server Action redirect handling.
    await signIn('oidc', {
      redirectTo
    })

    // This line is never reached because signIn() always redirects
    return {
      success: true
    }
  },

  async signOut(): Promise<AuthActionResult> {
    // signOut() from NextAuth throws NEXT_REDIRECT to trigger the redirect.
    // We must let this error propagate - don't catch it.
    await signOut({ redirectTo: '/auth/login' })

    // This line is never reached because signOut() always redirects
    return { success: true }
  }
}
