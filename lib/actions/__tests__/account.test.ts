import { revalidateTag } from 'next/cache'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { trackAccountDeleted } from '@/lib/analytics'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import * as dbActions from '@/lib/db/actions'
import { deleteUserObjects } from '@/lib/storage/r2-client'

import { deleteAccount } from '../account'

vi.mock('@/lib/analytics')
vi.mock('@/lib/auth/get-current-user')
vi.mock('@/lib/db/actions')
vi.mock('@/lib/storage/r2-client')

const originalEnableAuth = process.env.ENABLE_AUTH

describe('Account Actions', () => {
  const user = { id: '550e8400-e29b-41d4-a716-446655440000' }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ENABLE_AUTH = 'true'

    vi.mocked(getCurrentUser).mockResolvedValue(user as any)
    vi.mocked(dbActions.deleteUserChats).mockResolvedValue({ success: true })
    vi.mocked(dbActions.deleteUserNotes).mockResolvedValue({ success: true })
    vi.mocked(dbActions.deleteUserLibraryFiles).mockResolvedValue({
      success: true
    })
    vi.mocked(dbActions.anonymizeUserFeedback).mockResolvedValue({
      success: true
    })
    vi.mocked(deleteUserObjects).mockResolvedValue({
      deletedCount: 0,
      skipped: true
    })
    vi.mocked(trackAccountDeleted).mockResolvedValue()
  })

  afterEach(() => {
    process.env.ENABLE_AUTH = originalEnableAuth
  })

  it('returns an error in anonymous mode', async () => {
    process.env.ENABLE_AUTH = 'false'

    const result = await deleteAccount()

    expect(result).toEqual({
      success: false,
      error: 'Account deletion is unavailable in anonymous mode.'
    })
    expect(getCurrentUser).not.toHaveBeenCalled()
    expect(dbActions.deleteUserChats).not.toHaveBeenCalled()
  })

  it('returns an error when the user is not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const result = await deleteAccount()

    expect(result).toEqual({
      success: false,
      error: 'User not authenticated'
    })
    expect(dbActions.deleteUserChats).not.toHaveBeenCalled()
  })

  it('deletes app data, anonymizes feedback, and removes uploaded files', async () => {
    const result = await deleteAccount()

    expect(result).toEqual({ success: true })
    expect(dbActions.deleteUserChats).toHaveBeenCalledWith(user.id)
    expect(dbActions.deleteUserNotes).toHaveBeenCalledWith(user.id)
    expect(dbActions.deleteUserLibraryFiles).toHaveBeenCalledWith(user.id)
    expect(dbActions.anonymizeUserFeedback).toHaveBeenCalledWith(user.id)
    expect(deleteUserObjects).toHaveBeenCalledWith(user.id)
    expect(revalidateTag).toHaveBeenCalledWith('chat', 'max')
    expect(trackAccountDeleted).toHaveBeenCalledTimes(1)
  })

  it('stops before storage and auth deletion when app data deletion fails', async () => {
    vi.mocked(dbActions.deleteUserChats).mockResolvedValue({
      success: false,
      error: 'Failed to delete user chats'
    })

    const result = await deleteAccount()

    expect(result).toEqual({
      success: false,
      error: 'Failed to delete user chats'
    })
    expect(deleteUserObjects).not.toHaveBeenCalled()
    expect(trackAccountDeleted).not.toHaveBeenCalled()
  })

  it('stops before storage and auth deletion when notes deletion fails', async () => {
    vi.mocked(dbActions.deleteUserNotes).mockResolvedValue({
      success: false,
      error: 'Failed to delete user notes'
    })

    const result = await deleteAccount()

    expect(result).toEqual({
      success: false,
      error: 'Failed to delete user notes'
    })
    expect(deleteUserObjects).not.toHaveBeenCalled()
    expect(trackAccountDeleted).not.toHaveBeenCalled()
  })

  it('stops before storage and auth deletion when feedback anonymization fails', async () => {
    vi.mocked(dbActions.anonymizeUserFeedback).mockResolvedValue({
      success: false,
      error: 'Failed to anonymize user feedback'
    })

    const result = await deleteAccount()

    expect(result).toEqual({
      success: false,
      error: 'Failed to anonymize user feedback'
    })
    expect(deleteUserObjects).not.toHaveBeenCalled()
    expect(trackAccountDeleted).not.toHaveBeenCalled()
  })

  it('stops before storage and auth deletion when library file deletion fails', async () => {
    vi.mocked(dbActions.deleteUserLibraryFiles).mockResolvedValue({
      success: false,
      error: 'Failed to delete user files'
    })

    const result = await deleteAccount()

    expect(result).toEqual({
      success: false,
      error: 'Failed to delete user files'
    })
    expect(deleteUserObjects).not.toHaveBeenCalled()
    expect(trackAccountDeleted).not.toHaveBeenCalled()
  })

  it('stops before auth deletion when uploaded file deletion fails', async () => {
    vi.mocked(deleteUserObjects).mockRejectedValue(new Error('Storage error'))

    const result = await deleteAccount()

    expect(result).toEqual({
      success: false,
      error: 'Storage error'
    })
    expect(dbActions.deleteUserChats).toHaveBeenCalledWith(user.id)
    expect(dbActions.deleteUserNotes).toHaveBeenCalledWith(user.id)
    expect(dbActions.deleteUserLibraryFiles).toHaveBeenCalledWith(user.id)
    expect(trackAccountDeleted).not.toHaveBeenCalled()
  })

})
