/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test'
import { mock, instance, when, anything } from 'ts-mockito'

import { deleteEnrollment } from '../enrollment.usecase/delete'

import type { EnrollmentUsecaseDeps } from '../enrollment.usecase'

function createMocks(overrides?: {
  enrollment?: any | null
  activeInvoice?: any | null
}) {
  const repoMock = mock<EnrollmentUsecaseDeps['repo']>()
  const invoiceUsecaseMock = mock<EnrollmentUsecaseDeps['invoiceUsecase']>()

  when(repoMock.findById(anything(), anything())).thenResolve(overrides?.enrollment ?? null)
  when(invoiceUsecaseMock.findActiveByEnrollment(anything(), anything())).thenResolve(
    overrides?.activeInvoice ?? null,
  )
  when(repoMock.delete(anything(), anything())).thenResolve()

  return {
    repo: instance(repoMock),
    invoiceUsecase: instance(invoiceUsecaseMock),
  }
}

function baseDeps(overrides?: Partial<EnrollmentUsecaseDeps>): EnrollmentUsecaseDeps {
  const mocks = createMocks()
  return {
    repo: mocks.repo,
    branchRepo: {} as any,
    studentRepo: {} as any,
    programRepo: {} as any,
    invoiceUsecase: mocks.invoiceUsecase,
    transactor: {} as any,
    storage: {} as any,
    checkScheduleConflict: () => Promise.resolve(),
    ...overrides,
  }
}

describe('deleteEnrollment', () => {
  it('deletes enrollment when found and no active invoice', async () => {
    const enrollment = { id: 'enr-1', company_id: 'comp-1', status: 'active' }
    const deps = baseDeps({
      repo: (() => {
        const m = mock<EnrollmentUsecaseDeps['repo']>()
        when(m.findById('enr-1', 'comp-1')).thenResolve(enrollment as any)
        when(m.delete('enr-1', 'comp-1')).thenResolve()
        return instance(m)
      })(),
      invoiceUsecase: (() => {
        const m = mock<EnrollmentUsecaseDeps['invoiceUsecase']>()
        when(m.findActiveByEnrollment('enr-1', 'comp-1')).thenResolve(null)
        return instance(m)
      })(),
    })

    await deleteEnrollment(deps, 'enr-1', 'comp-1')

    expect(deps.repo.delete).toBeDefined()
  })

  it('throws 404 when enrollment not found', async () => {
    const deps = baseDeps()

    await expect(deleteEnrollment(deps, 'enr-999', 'comp-1')).rejects.toThrow('Enrollment not found')
  })

  it('throws 400 when enrollment has active invoice', async () => {
    const enrollment = { id: 'enr-1', company_id: 'comp-1', status: 'active' }
    const activeInvoice = { id: 'inv-1', status: 'unpaid' }
    const deps = baseDeps({
      repo: (() => {
        const m = mock<EnrollmentUsecaseDeps['repo']>()
        when(m.findById('enr-1', 'comp-1')).thenResolve(enrollment as any)
        return instance(m)
      })(),
      invoiceUsecase: (() => {
        const m = mock<EnrollmentUsecaseDeps['invoiceUsecase']>()
        when(m.findActiveByEnrollment('enr-1', 'comp-1')).thenResolve(activeInvoice as any)
        return instance(m)
      })(),
    })

    await expect(deleteEnrollment(deps, 'enr-1', 'comp-1')).rejects.toThrow(
      'Cannot delete enrollment with active invoice',
    )
  })
})
