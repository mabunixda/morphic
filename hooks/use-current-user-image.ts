import { useEffect, useState } from 'react'

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => (res.ok ? res.json() : null))
      .then(session => setImage(session?.user?.image ?? null))
      .catch(() => {
        // Auth not configured, skip silently
      })
  }, [])

  return image
}
