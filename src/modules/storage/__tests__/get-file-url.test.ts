import { describe, expect, it } from 'bun:test'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo, StorageFile } from '@/contracts/storage.contract'

import { getFileUrl } from '../storage.usecase/get-file-url'

const existingFile: StorageFile = {
  id: 'file-1',
  companyId: 'comp-1',
  createdBy: 'user-1',
  folder: 'uploads',
  objectKey: 'private/comp-1/uploads/123-file.pdf',
  originalFilename: 'receipt.pdf',
  contentType: 'application/pdf',
  isPublic: false,
  status: 'attached',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

function createMocks(findByIdResult: StorageFile | null = existingFile) {
  const storageMock = mock<IStorageService>()
  const repoMock = mock<IStorageRepo>()

  when(repoMock.findById('file-1', 'comp-1')).thenResolve(findByIdResult)
  when(storageMock.getPresignedUrl('private/comp-1/uploads/123-file.pdf', anything()))
    .thenResolve('https://presigned.example.com/file.pdf')

  return {
    storage: instance(storageMock),
    repo: instance(repoMock),
    storageMock,
    repoMock,
  }
}

describe('getFileUrl', () => {
  it('returns presigned URL for existing file', async () => {
    const { storage, repo, repoMock } = createMocks()

    const result = await getFileUrl(storage, repo, 'file-1', 'comp-1')

    verify(repoMock.findById('file-1', 'comp-1')).once()
    expect(result.url).toBe('https://presigned.example.com/file.pdf')
    expect(result.key).toBe('private/comp-1/uploads/123-file.pdf')
  })

  it('passes expiresIn to storage', async () => {
    const { storage, repo, storageMock } = createMocks()

    await getFileUrl(storage, repo, 'file-1', 'comp-1', 600)

    verify(storageMock.getPresignedUrl('private/comp-1/uploads/123-file.pdf', 600)).once()
  })

  it('throws 404 when file not found', async () => {
    const { storage, repo } = createMocks(null)

    await expect(getFileUrl(storage, repo, 'file-999', 'comp-1')).rejects.toThrow('File not found')
  })
})
