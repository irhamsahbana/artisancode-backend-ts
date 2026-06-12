import { describe, expect, it } from 'bun:test'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo } from '@/contracts/storage.contract'

import { uploadFile, buildObjectKey } from '../storage.usecase/upload-file'

function createMocks() {
  const storageMock = mock<IStorageService>()
  const repoMock = mock<IStorageRepo>()

  when(repoMock.create(anything())).thenResolve({
    id: 'file-1',
    companyId: 'comp-1',
    createdBy: 'user-1',
    folder: 'uploads',
    objectKey: 'private/comp-1/uploads/123-file.pdf',
    originalFilename: 'file.pdf',
    contentType: 'application/pdf',
    isPublic: false,
    status: 'attached',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  })

  when(storageMock.upload(anything())).thenResolve({
    url: 'https://s3.example.com/file.pdf',
    key: 'private/comp-1/uploads/123-file.pdf',
  })

  return {
    storage: instance(storageMock),
    repo: instance(repoMock),
    storageMock,
    repoMock,
  }
}

describe('uploadFile', () => {
  it('uploads file, creates db record, and marks attached', async () => {
    const { storage, repo, storageMock, repoMock } = createMocks()

    const result = await uploadFile(storage, repo, {
      companyId: 'comp-1',
      createdBy: 'user-1',
      folder: 'uploads',
      file: Buffer.from('fake-pdf'),
      filename: 'receipt.pdf',
      contentType: 'application/pdf',
    })

    verify(repoMock.create(anything())).once()
    verify(storageMock.upload(anything())).once()
    verify(repoMock.markAttached('file-1', 'comp-1')).once()
    expect(result.fileId).toBe('file-1')
    expect(result.url).toBe('https://s3.example.com/file.pdf')
  })

  it('propagates storage upload errors', async () => {
    const storageMock = mock<IStorageService>()
    const repoMock = mock<IStorageRepo>()

    when(repoMock.create(anything())).thenResolve({
      id: 'file-1', companyId: 'comp-1', createdBy: 'user-1', folder: '',
      objectKey: 'test', originalFilename: 'f', contentType: 'text/plain',
      isPublic: false, status: 'pending', createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    })
    when(storageMock.upload(anything())).thenReject(new Error('S3 timeout'))

    await expect(
      uploadFile(instance(storageMock), instance(repoMock), {
        companyId: 'comp-1', createdBy: 'user-1', folder: '',
        file: Buffer.from('data'), filename: 'f.txt', contentType: 'text/plain',
      }),
    ).rejects.toThrow('S3 timeout')

    verify(repoMock.markAttached(anything(), anything())).never()
  })
})

describe('buildObjectKey', () => {
  it('builds private key with folder and sanitized filename', () => {
    const key = buildObjectKey('comp-1', 'uploads', 'my receipt.pdf', false)
    expect(key).toMatch(/^private\/comp-1\/uploads\/\d+-my_receipt\.pdf$/)
  })

  it('builds public key when isPublic is true', () => {
    const key = buildObjectKey('comp-1', 'logos', 'logo.png', true)
    expect(key).toMatch(/^public\/comp-1\/logos\/\d+-logo\.png$/)
  })

  it('handles empty folder', () => {
    const key = buildObjectKey('comp-1', '', 'file.txt', false)
    expect(key).toMatch(/^private\/comp-1\/\d+-file\.txt$/)
  })
})
