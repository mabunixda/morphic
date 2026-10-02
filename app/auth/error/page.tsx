import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign-in failed.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {params?.error
                ? `Error: ${params.error}`
                : 'An unspecified error occurred.'}
            </p>
            <a className="mt-4 inline-block text-sm underline" href="/auth/login">
              Try again
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
