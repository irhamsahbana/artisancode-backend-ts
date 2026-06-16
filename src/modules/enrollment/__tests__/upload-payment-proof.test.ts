/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, mock } from 'bun:test'

import { AppError } from '@/common/packages/types'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'
import { uploadPaymentProof } from '../enrollment.usecase/upload-payment-proof'

function createMockDeps(overrides?: Partial<EnrollmentUsecaseDeps>): EnrollmentUsecaseDeps {
  return {
    repo: {
      create: mock(() => Promise.resolve({} as any)),
      update: mock(() => Promise.resolve({ id: 'enr-1', payment_proof_url: 'https://s3.example.com/proof.pdf' } as any)),
      delete: mock(() => Promise.resolve()),
      findById: mock(() =>
        Promise.resolve({
          id: 'enr-1',
          company_id: 'comp-1',
          status: 'active',
        } as any),
      ),
      findByStudentAndProgram: mock(() => Promise.resolve(null)),
      findActiveByStudentAndProgram: mock(() => Promise.resolve(null)),
      findActiveByStudent: mock(() => Promise.resolve([])),
      findList: mock(() => Promise.resolve({ items: [], pagination: {} } as any)),
      countActiveByProgram: mock(() => Promise.resolve(0)),
      countActiveByPricing: mock(() => Promise.resolve(0)),
    } as any,
    branchRepo: {} as any,
    studentRepo: {} as any,
    programRepo: {} as any,
    invoiceUsecase: {} as any,
    transactor: {} as any,
    storage: {
      upload: mock(() => Promise.resolve({ url: 'https://s3.example.com/proof.pdf', key: 'payment-proofs/comp-1/enr-1/proof.pdf' })),
      delete: mock(() => Promise.resolve()),
    } as any,
    checkScheduleConflict: mock(() => Promise.resolve()),
    ...overrides,
  }
}

describe('uploadPaymentProof', () => {
  it('uploads file and updates enrollment with payment proof url', async () => {
    const deps = createMockDeps()
    const file = Buffer.from('fake-pdf-content')

    const result = await uploadPaymentProof(deps, {
      id: 'enr-1',
      company_id: 'comp-1',
      file,
      filename: 'proof.pdf',
    })

    expect(deps.repo.findById).toHaveBeenCalledWith('enr-1', 'comp-1')
    expect(deps.storage.upload).toHaveBeenCalledWith({
      key: 'payment-proofs/comp-1/enr-1/proof.pdf',
      body: file,
      contentType: 'application/octet-stream',
    })
    expect(deps.repo.update).toHaveBeenCalledWith({
      id: 'enr-1',
      company_id: 'comp-1',
      payment_proof_url: 'https://s3.example.com/proof.pdf',
    })
    expect(result.id).toBe('enr-1')
  })

  it('throws 404 when enrollment not found', async () => {
    const deps = createMockDeps()
    deps.repo.findById = mock(() => Promise.resolve(null)) as any

    await expect(
      uploadPaymentProof(deps, {
        id: 'enr-999',
        company_id: 'comp-1',
        file: Buffer.from('data'),
        filename: 'proof.pdf',
      }),
    ).rejects.toThrow(AppError)

    expect(deps.storage.upload).not.toHaveBeenCalled()
    expect(deps.repo.update).not.toHaveBeenCalled()
  })

  it('propagates storage upload errors', async () => {
    const deps = createMockDeps({
      storage: {
        upload: mock(() => Promise.reject(new Error('S3 timeout'))),
        delete: mock(() => Promise.resolve()),
      } as any,
    })

    await expect(
      uploadPaymentProof(deps, {
        id: 'enr-1',
        company_id: 'comp-1',
        file: Buffer.from('data'),
        filename: 'proof.pdf',
      }),
    ).rejects.toThrow('S3 timeout')

    expect(deps.repo.update).not.toHaveBeenCalled()
  })
})
