'use client'

import { createContext, useContext } from 'react'

const UserContext = createContext(false)
const AuthEnabledContext = createContext(false)

export function UserProvider({
  hasUser,
  authEnabled = false,
  children
}: {
  hasUser: boolean
  /** True when real (OIDC) authentication is on, i.e. not anonymous mode. */
  authEnabled?: boolean
  children: React.ReactNode
}) {
  return (
    <AuthEnabledContext.Provider value={authEnabled}>
      <UserContext.Provider value={hasUser}>{children}</UserContext.Provider>
    </AuthEnabledContext.Provider>
  )
}

export function useHasUser() {
  return useContext(UserContext)
}

export function useAuthEnabled() {
  return useContext(AuthEnabledContext)
}
