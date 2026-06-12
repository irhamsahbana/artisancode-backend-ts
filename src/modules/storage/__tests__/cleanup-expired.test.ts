import { describe, expect, it } from 'bun:test'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo, StorageFile } from '@/contracts/storage.contract'

import { cleanupExpiredFiles } from '../storage.usecase/cleanup-expired'

const expiredFiles: StorageFile[] = [
  {
    id: 'f1', companyId: 'comp-1', createdBy: 'user-1', folder: '',
    objectKey: 'private/comp-1/f1.pdf', originalFilename: 'f1.pdf',
    contentType: 'application/pdf', isPublic: false, status: 'pending',
    createdAt: new Date('2023-01-01'), updatedAt: new Date(), deletedAt: null,
  },
  {
    id: 'f2', companyId: 'comp-1', createdBy: 'user-1', folder: '',
    objectKey: 'private/comp-1/f2.pdf', originalFilename: 'f2.pdf',
    contentType: 'application/pdf', isPublic: false, status: 'pending',
    createdAt: new Date('2023-01-01'), updatedAt: new Date(), deletedAt: null,
  },
]

describe('cleanupExpiredFiles', () => {
  it('deletes expired pending files from S3 and marks deleted in db', async () => {
    const storageMock = mock<IStorageService>()
    const repoMock = mock<IStorageRepo>()

    when(repoMock.getExpiredPending(anything(), anything())).thenResolve(expiredFiles)
    when(storageMock.delete(anything())).thenResolve()

    const result = await cleanupExpiredFiles(
      instance(storageMock),
      instance(repoMock),
      { before: new Date('2024-01-01'), limit: 50 },
    )

    verify(storageMock.delete('private/comp-1/f1.pdf')).once()
    verify(storageMock.delete('private/comp-1/f2.pdf')).once()
    verify(repoMock.markDeleted('f1', 'comp-1')).once()
    verify(repoMock.markDeleted('f2', 'comp-1')).once()
    expect(result.scanned).toBe(2)
    expect(result.deleted).toBe(2)
  })

  it('continues on S3 delete error for first file', async () => {
    const storageMock = mock<IStorageService>()
    const repoMock = mock<IStorageRepo>()

    when(repoMock.getExpiredPending(anything(), anything())).thenResolve(expiredFiles)
    when(storageMock.delete('private/comp-1/f1.pdf')).thenReject(new Error('S3 error'))
    when(storageMock.delete('private/comp-1/f2.pdf')).thenResolve()

    const result = await cleanupExpiredFiles(instance(storageMock), instance(repoMock), {})

    expect(result.scanned).toBe(2)
    expect(result.deleted).toBe(1) // f1 failed, f2 succeeded
    verify(repoMock.markDeleted('f1', 'comp-1')).never()
    verify(repoMock.markDeleted('f2', 'comp-1')).once()
  })

  it('returns zero when no expired files found', async () => {
    const storageMock = mock<IStorageService>()
    const repoMock = mock<IStorageRepo>()

    when(repoMock.getExpiredPending(anything(), anything())).thenResolve([])

    const result = await cleanupExpiredFiles(instance(storageMock), instance(repoMock), {})

    expect(result.scanned).toBe(0)
    expect(result.deleted).toBe(0)
    verify(storageMock.delete(anything())).never()
  })
})
