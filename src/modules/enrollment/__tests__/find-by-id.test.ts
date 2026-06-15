/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test'
import { mock, instance, when } from 'ts-mockito'

import type { Enrollment } from '@/entities/enrollment.entity'

import { findEnrollmentById } from '../enrollment.usecase/find-by-id'

import type { EnrollmentUsecaseDeps } from '../enrollment.usecase'

describe('findEnrollmentById', () => {
  it('returns enrollment when found', async () => {
    const repoMock = mock<EnrollmentUsecaseDeps['repo']>()
    const enrollment: Enrollment = { id: 'enr-1', company_id: 'comp-1', branch_id: 'branch-1', student_id: 'student-1', program_id: 'prog-1', pricing_id: 'pricing-1', status: 'active', created_at: new Date(), updated_at: new Date(), deleted_at: null }
    when(repoMock.findById('enr-1', 'comp-1')).thenResolve(enrollment)

    const deps: EnrollmentUsecaseDeps = {
      repo: instance(repoMock),
      branchRepo: {} as any,
      studentRepo: {} as any,
      programRepo: {} as any,
      invoiceUsecase: {} as any,
      transactor: {} as any,
      storage: {} as any,
      checkScheduleConflict: () => Promise.resolve(),
    }

    const result = await findEnrollmentById(deps, 'enr-1', 'comp-1')
    expect(result).toEqual(enrollment)
  })

  it('returns null when not found', async () => {
    const repoMock = mock<EnrollmentUsecaseDeps['repo']>()
    when(repoMock.findById('enr-999', 'comp-1')).thenResolve(null)

    const deps: EnrollmentUsecaseDeps = {
      repo: instance(repoMock),
      branchRepo: {} as any,
      studentRepo: {} as any,
      programRepo: {} as any,
      invoiceUsecase: {} as any,
      transactor: {} as any,
      storage: {} as any,
      checkScheduleConflict: () => Promise.resolve(),
    }

    const result = await findEnrollmentById(deps, 'enr-999', 'comp-1')
    expect(result).toBeNull()
  })
})
