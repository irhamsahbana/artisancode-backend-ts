/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test'
import { mock, instance, when, anything } from 'ts-mockito'

import { findEnrollmentList } from '../enrollment.usecase/find-list'

import type { EnrollmentUsecaseDeps } from '../enrollment.usecase'

describe('findEnrollmentList', () => {
  it('returns enrollment list from repo', async () => {
    const repoMock = mock<EnrollmentUsecaseDeps['repo']>()
    const listResult = {
      items: [
        { id: 'enr-1', status: 'active' },
        { id: 'enr-2', status: 'inactive' },
      ],
      pagination: { page: 1, per_page: 10, total: 2, total_pages: 1 },
    }
    when(repoMock.findList(anything())).thenResolve(listResult as any)

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

    const result = await findEnrollmentList(deps, { company_id: 'comp-1' })
    expect(result.items).toHaveLength(2)
    expect(result.pagination.total).toBe(2)
  })
})
