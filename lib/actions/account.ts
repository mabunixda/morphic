'use server'

import { revalidateTag } from 'next/cache'

import { trackAccountDeleted } from '@/lib/analytics'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import * as dbActions from '@/lib/db/actions'
import { deleteUserObjects } from '@/lib/storage/r2-client'

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Failed to delete account'
}

export async function deleteAccount(): Promise<{
  success: boolean
  error?: string
}> {
  if (process.env.ENABLE_AUTH === 'false') {
    return {
      success: false,
      error: 'Account deletion is unavailable in anonymous mode.'
    }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  try {
    const deleteChatsResult = await dbActions.deleteUserChats(user.id)
    if (!deleteChatsResult.success) {
      return {
        success: false,
        error: deleteChatsResult.error ?? 'Failed to delete account data'
      }
    }

    const deleteNotesResult = await dbActions.deleteUserNotes(user.id)
    if (!deleteNotesResult.success) {
      return {
        success: false,
        error: deleteNotesResult.error ?? 'Failed to delete account data'
      }
    }

    const deleteFilesResult = await dbActions.deleteUserLibraryFiles(user.id)
    if (!deleteFilesResult.success) {
      return {
        success: false,
        error: deleteFilesResult.error ?? 'Failed to delete account data'
      }
    }

    const anonymizeFeedbackResult = await dbActions.anonymizeUserFeedback(
      user.id
    )
    if (!anonymizeFeedbackResult.success) {
      return {
        success: false,
        error:
          anonymizeFeedbackResult.error ?? 'Failed to anonymize user feedback'
      }
    }

    await deleteUserObjects(user.id)

    // The identity itself lives in the OIDC provider and is not deleted here.

    revalidateTag('chat', 'max')
    await trackAccountDeleted(user.id)

    return { success: true }
  } catch (error) {
    console.error(`Error deleting account for user ${user.id}:`, error)
    return { success: false, error: getErrorMessage(error) }
  }
}
