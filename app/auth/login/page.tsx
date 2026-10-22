import { getAuthProvider, resolveAuthProviderName } from '@/lib/auth/provider'

import { LoginForm } from '@/components/login-form'

// Capabilities and provider selection depend on runtime env (AUTH_PROVIDER);
// a prerendered login page would bake in build-time values in prebuilt images.
export const dynamic = 'force-dynamic'

export default async function Page(props: {
  searchParams: Promise<{ next?: string; confirmed?: string }>
}) {
  const { next, confirmed } = await props.searchParams
  const provider = resolveAuthProviderName()
  const providerDisplayName = process.env.OIDC_PROVIDER_NAME || 'SSO'
  const authProvider = getAuthProvider()
  const capabilities = authProvider.capabilities

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm 
          next={next} 
          confirmed={confirmed === '1'} 
          provider={provider}
          providerDisplayName={providerDisplayName}
          capabilities={capabilities}
        />
      </div>
    </div>
  )
}
