/** Minimal user shape used across the app (replaces the Supabase `User`). */
export interface AuthUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  /** Only used by the optional cloud usage budget. */
  created_at?: string | null
}
