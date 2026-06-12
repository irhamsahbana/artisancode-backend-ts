import { describe, expect, it } from 'bun:test'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo, StorageFile } from '@/contracts/storage.contract'

import { deleteFile } from '../storage.usecase/delete-file'

const pendingFile: StorageFile = {
  id: 'file-1',
  companyId: 'comp-1',
  createdBy: 'user-1',
  folder: 'uploads',
  objectKey: 'private/comp-1/uploads/123-file.pdf',
  originalFilename: 'receipt.pdf',
  contentType: 'application/pdf',
  isPublic: false,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

function createMocks(findByIdResult: StorageFile | null = pendingFile) {
  const storageMock = mock<IStorageService>()
  const repoMock = mock<IStorageRepo>()

  when(repoMock.findById('file-1', 'comp-1')).thenResolve(findByIdResult)
  when(storageMock.delete(anything())).thenResolve()

  return {
    storage: instance(storageMock),
    repo: instance(repoMock),
    storageMock,
    repoMock,
  }
}

describe('deleteFile', () => {
  it('deletes pending file from S3 and marks deleted in db', async () => {
    const { storage, repo, storageMock, repoMock } = createMocks()

    await deleteFile(storage, repo, 'file-1', 'comp-1')

    verify(repoMock.findById('file-1', 'comp-1')).once()
    verify(storageMock.delete('private/comp-1/uploads/123-file.pdf')).once()
    verify(repoMock.markDeleted('file-1', 'comp-1')).once()
  })

  it('throws 404 when file not found', async () => {
    const { storage, repo, storageMock } = createMocks(null)

    await expect(deleteFile(storage, repo, 'file-999', 'comp-1')).rejects.toThrow('File not found')
    verify(storageMock.delete(anything())).never()
  })

  it('throws 400 when file is not pending', async () => {
    const attachedFile: StorageFile = { ...pendingFile, status: 'attached' }
    const { storage, repo, storageMock, repoMock } = createMocks(attachedFile)

    await expect(deleteFile(storage, repo, 'file-1', 'comp-1')).rejects.toThrow('File can no longer be deleted')
    verify(storageMock.delete(anything())).never()
    verify(repoMock.markDeleted(anything(), anything())).never()
  })
})
