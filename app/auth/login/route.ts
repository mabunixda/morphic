import { signIn } from '@/lib/auth/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'
  // Only allow same-site relative redirects
  const redirectTo = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  // signIn() throws a redirect to the identity provider
  return signIn('oidc', { redirectTo })
}
