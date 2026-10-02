import NextAuth from 'next-auth'
import { getBaseUrl } from '../utils/url'

/**
 * Generic OpenID Connect authentication (Authentik, Keycloak, Zitadel, ...).
 *
 * Sessions are stateless JWT cookies, so no extra database tables are needed.
 * The OIDC `sub` claim becomes the Morphic user id (users.user_id is varchar(255)).
 */

async function initializeAuthUrl() {
  if (!process.env.AUTH_URL) {
    process.env.AUTH_URL = await getBaseUrl()
      .then((url) => url.toString())
      .catch(() => 'http://localhost:3000')
  }
}

await initializeAuthUrl()

export const oidcConfigured = () =>
  Boolean(
    process.env.OIDC_ISSUER &&
      process.env.OIDC_CLIENT_ID &&
      process.env.OIDC_CLIENT_SECRET
  )

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // we run behind a reverse proxy
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login', error: '/auth/error' },
  providers: [
    {
      id: 'oidc',
      name: process.env.OIDC_PROVIDER_NAME || 'SSO',
      type: 'oidc',
      issuer: process.env.OIDC_ISSUER,
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      authorization: {
        params: { scope: process.env.OIDC_SCOPE || 'openid profile email' }
      }
    }
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.sub = profile.sub ?? token.sub
        token.name =
          (profile.name as string | undefined) ??
          (profile.preferred_username as string | undefined) ??
          token.name
        token.email = (profile.email as string | undefined) ?? token.email
        token.picture = (profile.picture as string | undefined) ?? token.picture
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub
      return session
    }
  }
})
