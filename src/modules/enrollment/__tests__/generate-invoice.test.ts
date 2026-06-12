/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test'
import { mock, instance, when, anything } from 'ts-mockito'

import { generateEnrollmentInvoice } from '../enrollment.usecase/generate-invoice'

import type { EnrollmentUsecaseDeps } from '../enrollment.usecase'

function makeEnrollment(overrides?: Record<string, any>) {
  return {
    id: 'enr-1',
    company_id: 'comp-1',
    branch_id: 'branch-1',
    student_id: 'student-1',
    program_id: 'prog-1',
    pricing_id: 'pricing-1',
    currency: 'IDR',
    status: 'active',
    enrollment_date: new Date('2024-01-15'),
    next_billing_date: new Date('2024-02-15'),
    pricing: {
      id: 'pricing-1',
      prices: [
        {
          id: 'price-1',
          currency: 'IDR',
          price: 500000,
          startedAt: new Date('2024-01-01'),
          endedAt: null,
        },
      ],
    },
    ...overrides,
  }
}

function makeDeps(overrides: {
  enrollment?: any | null
  activeInvoice?: any | null
}) {
  const repoMock = mock<EnrollmentUsecaseDeps['repo']>()
  const invoiceUsecaseMock = mock<EnrollmentUsecaseDeps['invoiceUsecase']>()

  when(repoMock.findById(anything(), anything())).thenResolve(overrides.enrollment ?? null)
  when(invoiceUsecaseMock.findActiveByEnrollment(anything(), anything())).thenResolve(
    overrides.activeInvoice ?? null,
  )
  when(invoiceUsecaseMock.create(anything())).thenResolve({ id: 'inv-new' } as any)
  when(invoiceUsecaseMock.generatePaymentLink(anything(), anything())).thenResolve({
    id: 'inv-new',
    paymentUrl: 'https://pay.example.com',
  } as any)

  return {
    deps: {
      repo: instance(repoMock),
      branchRepo: {} as any,
      studentRepo: {} as any,
      programRepo: {} as any,
      invoiceUsecase: instance(invoiceUsecaseMock),
      transactor: {} as any,
      storage: {} as any,
      checkScheduleConflict: () => Promise.resolve(),
    } as EnrollmentUsecaseDeps,
    repoMock,
    invoiceUsecaseMock,
  }
}

describe('generateEnrollmentInvoice', () => {
  it('generates new invoice when no active invoice exists', async () => {
    const { deps } = makeDeps({ enrollment: makeEnrollment() })

    const result = await generateEnrollmentInvoice(deps, {
      id: 'enr-1',
      company_id: 'comp-1',
    })

    expect(result.id).toBe('inv-new')
    expect(result.paymentUrl).toBe('https://pay.example.com')
  })

  it('returns existing payment link when active invoice exists', async () => {
    const activeInvoice = { id: 'inv-active', status: 'unpaid', paymentUrl: 'https://existing.pay' }
    const { deps, invoiceUsecaseMock } = makeDeps({
      enrollment: makeEnrollment(),
      activeInvoice,
    })

    when(invoiceUsecaseMock.generatePaymentLink('inv-active', 'comp-1')).thenResolve(activeInvoice as any)

    const result = await generateEnrollmentInvoice(deps, {
      id: 'enr-1',
      company_id: 'comp-1',
    })

    expect(result.id).toBe('inv-active')
  })

  it('throws 404 when enrollment not found', async () => {
    const { deps } = makeDeps({ enrollment: null })

    await expect(
      generateEnrollmentInvoice(deps, { id: 'enr-999', company_id: 'comp-1' }),
    ).rejects.toThrow('Enrollment not found')
  })

  it('throws 400 when enrollment is not active', async () => {
    const { deps } = makeDeps({ enrollment: makeEnrollment({ status: 'inactive' }) })

    await expect(
      generateEnrollmentInvoice(deps, { id: 'enr-1', company_id: 'comp-1' }),
    ).rejects.toThrow('Enrollment is not active')
  })

  it('throws 400 when pricing has no valid price', async () => {
    const { deps } = makeDeps({
      enrollment: makeEnrollment({
        pricing: { id: 'pricing-1', prices: [] },
      }),
    })

    await expect(
      generateEnrollmentInvoice(deps, { id: 'enr-1', company_id: 'comp-1' }),
    ).rejects.toThrow('Pricing is not available for this enrollment')
  })
})
