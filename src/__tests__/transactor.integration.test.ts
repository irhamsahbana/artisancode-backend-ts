import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { eq, sql } from 'drizzle-orm'

import { resetDb } from '@/common/db'
import { getExecutor, transactor } from '@/common/executor'
import { branches, companies } from '@/db/schema'

import { cleanupTestDb, createTestDb } from './helpers/db'

import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'

let container: StartedPostgreSqlContainer

beforeAll(async () => {
  const result = await createTestDb()
  container = result.container
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resetDb(result.db as any)
}, 60_000)

afterAll(async () => {
  if (container) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await cleanupTestDb(container, getExecutor() as any)
  }
})

// Helper: count companies
async function countCompanies(): Promise<number> {
  const exec = getExecutor()
  const [result] = await exec
    .select({ count: sql<number>`count(*)::int` })
    .from(companies)
  return result.count
}

// Helper: find company by name
async function findCompanyByName(name: string) {
  const exec = getExecutor()
  const [row] = await exec
    .select()
    .from(companies)
    .where(eq(companies.name, name))
    .limit(1)
  return row ?? null
}

describe('WithinTransaction — integration', () => {
  // 1. Commit: data persists after withinTransaction succeeds
  it('commits data when callback succeeds', async () => {
    const name = `commit-test-${Date.now()}`

    await transactor.withinTransaction(async () => {
      await getExecutor()
        .insert(companies)
        .values({ name, status: 'active' })
    })

    const found = await findCompanyByName(name)
    expect(found).not.toBeNull()
    expect(found?.name).toBe(name)
  })

  // 2. Rollback: data is rolled back when callback throws
  it('rolls back data when callback throws', async () => {
    const name = `rollback-test-${Date.now()}`
    const countBefore = await countCompanies()

    await expect(
      transactor.withinTransaction(async () => {
        await getExecutor()
          .insert(companies)
          .values({ name, status: 'active' })
        throw new Error('Intentional failure')
      }),
    ).rejects.toThrow('Intentional failure')

    const countAfter = await countCompanies()
    expect(countAfter).toBe(countBefore)

    const found = await findCompanyByName(name)
    expect(found).toBeNull()
  })

  // 3. Nested: inner withinTransaction reuses outer transaction
  it('nested withinTransaction reuses outer transaction (no deadlock)', async () => {
    const name1 = `nested-outer-${Date.now()}`
    const name2 = `nested-inner-${Date.now()}`

    await transactor.withinTransaction(async () => {
      await getExecutor()
        .insert(companies)
        .values({ name: name1, status: 'active' })

      await transactor.withinTransaction(async () => {
        await getExecutor()
          .insert(companies)
          .values({ name: name2, status: 'active' })
      })
    })

    const found1 = await findCompanyByName(name1)
    const found2 = await findCompanyByName(name2)
    expect(found1).not.toBeNull()
    expect(found2).not.toBeNull()
  })

  // 4. Nested rollback: inner failure rolls back entire outer transaction
  it('nested failure rolls back entire outer transaction', async () => {
    const name1 = `nested-fail-outer-${Date.now()}`
    const name2 = `nested-fail-inner-${Date.now()}`
    const countBefore = await countCompanies()

    await expect(
      transactor.withinTransaction(async () => {
        await getExecutor()
          .insert(companies)
          .values({ name: name1, status: 'active' })

        await transactor.withinTransaction(async () => {
          await getExecutor()
            .insert(companies)
            .values({ name: name2, status: 'active' })
          throw new Error('Inner failure')
        })
      }),
    ).rejects.toThrow('Inner failure')

    const countAfter = await countCompanies()
    expect(countAfter).toBe(countBefore)

    const found1 = await findCompanyByName(name1)
    const found2 = await findCompanyByName(name2)
    expect(found1).toBeNull()
    expect(found2).toBeNull()
  })

  // 5. Multi-table: two different tables in the same transaction
  it('commits changes to multiple tables atomically', async () => {
    const companyName = `multi-table-${Date.now()}`

    const result = await transactor.withinTransaction(async () => {
      const [company] = await getExecutor()
        .insert(companies)
        .values({ name: companyName, status: 'active' })
        .returning()

      await getExecutor()
        .insert(branches)
        .values({
          companyId: company.id,
          name: `Branch for ${companyName}`,
          city: 'Jakarta',
        })

      return company
    })

    const foundCompany = await findCompanyByName(companyName)
    expect(foundCompany).not.toBeNull()
    expect(foundCompany?.id).toBe(result.id)

    const exec = getExecutor()
    const [foundBranch] = await exec
      .select()
      .from(branches)
      .where(eq(branches.companyId, result.id))
      .limit(1)
    expect(foundBranch).toBeDefined()
    expect(foundBranch.name).toBe(`Branch for ${companyName}`)
  })

  // 6. Multi-table rollback: failure after partial writes rolls back all
  it('rolls back multiple tables on failure', async () => {
    const companyName = `multi-rollback-${Date.now()}`
    const countBefore = await countCompanies()

    await expect(
      transactor.withinTransaction(async () => {
        const [company] = await getExecutor()
          .insert(companies)
          .values({ name: companyName, status: 'active' })
          .returning()

        await getExecutor()
          .insert(branches)
          .values({
            companyId: company.id,
            name: `Branch for ${companyName}`,
            city: 'Jakarta',
          })

        throw new Error('Fail after both inserts')
      }),
    ).rejects.toThrow('Fail after both inserts')

    const countAfter = await countCompanies()
    expect(countAfter).toBe(countBefore)
  })

  // 7. Without transaction: getExecutor() uses global db directly
  it('getExecutor() works outside transaction (uses global db)', async () => {
    const name = `no-tx-test-${Date.now()}`
    const countBefore = await countCompanies()

    await getExecutor()
      .insert(companies)
      .values({ name, status: 'active' })

    const countAfter = await countCompanies()
    expect(countAfter).toBe(countBefore + 1)

    const found = await findCompanyByName(name)
    expect(found).not.toBeNull()
  })
})
