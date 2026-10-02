import { useEffect, useState } from 'react'

export const useCurrentUserName = () => {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => (res.ok ? res.json() : null))
      .then(session => setName(session?.user?.name ?? '?'))
      .catch(() => setName('Anonymous'))
  }, [])

  return name || '?'
}
