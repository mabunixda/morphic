import { perfLog } from '@/lib/utils/perf-logging'
import { incrementAuthCallCount } from '@/lib/utils/perf-tracking'

import { auth, oidcConfigured } from './auth'
import type { AuthUser } from './types'

export type { AuthUser } from './types'

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!oidcConfigured()) {
    return null // OIDC is not configured
  }

  const session = await auth()
  const user = session?.user
  if (!user?.id) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image
  }
}

export async function getCurrentUserId() {
  const count = incrementAuthCallCount()
  perfLog(`getCurrentUserId called - count: ${count}`)

  // Skip authentication mode (for personal Docker deployments)
  if (process.env.ENABLE_AUTH === 'false') {
    // Guard: Prevent disabling auth in Morphic Cloud deployments
    if (process.env.MORPHIC_CLOUD_DEPLOYMENT === 'true') {
      throw new Error(
        'ENABLE_AUTH=false is not allowed in MORPHIC_CLOUD_DEPLOYMENT'
      )
    }

    // Always warn when authentication is disabled (except in tests)
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '⚠️  Authentication disabled. Running in anonymous mode.\n' +
          '   All users share the same user ID. For personal use only.'
      )
    }

    return process.env.ANONYMOUS_USER_ID || 'anonymous-user'
  }

  const user = await getCurrentUser()
  return user?.id
}
