'use client'


import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { IconLogo } from '@/components/ui/icons'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
            <IconLogo className="size-14" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Continue with Morphic
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            To use Morphic, sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-3">
          <Button asChild className="w-full" size="lg">
            <a href="/auth/sign-up">Sign Up</a>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <a href="/auth/login">Sign In</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
