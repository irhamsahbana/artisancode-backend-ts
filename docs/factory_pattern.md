# Factory Pattern

This project uses a consistent **functional factory pattern** across all layers. Each layer exports a factory function that returns an object implementing a contract interface, with dependencies injected as parameters.

## Overview

```
Contract (Interface)
    ↓
Factory Function (creates implementation)
    ↓
Dependencies injected via params
```

## Pattern by Layer

### 1. Repository Layer

**File**: `*.repo.ts` + `*.repo/*.ts`

```typescript
// contracts/company.contract.ts
export interface ICompanyRepo {
  create(req: Entity.CreateCompanyReq): Promise<Entity.Company>
  findById(req: Entity.GetCompanyReq): Promise<Entity.Company | null>
}

// company.repo.ts
import { ICompanyRepo } from '@/contracts/company.contract'
import { createCompany } from './company.repo/create'
import { findCompanyById } from './company.repo/find-by-id'

export function createCompanyRepo(): ICompanyRepo {
  return {
    create: (req) => createCompany(req),
    findById: (req) => findCompanyById(req),
  }
}

export default createCompanyRepo

// company.repo/create.ts
import * as Entity from '@/entities/company.entity'
import { ICompanyRepo } from '@/contracts/company.contract'

export async function createCompany(
  req: Entity.CreateCompanyReq,
): Promise<Entity.Company> {
  // Drizzle ORM implementation
  return db.insert(companies).values(req).returning()
}
```

**Key Points**:
- Factory function takes no parameters (DB connection is module-level)
- Each operation is a separate file
- Returns object implementing the contract interface

---

### 2. Usecase Layer

**File**: `*.usecase.ts` + `*.usecase/*.ts`

```typescript
// company.usecase.ts
import { ICompanyRepo, ICompanyUsecase } from '@/contracts/company.contract'
import { createCompany } from './company.usecase/create'
import { findCompanyById } from './company.usecase/find-by-id'

export interface CompanyUsecaseDeps {
  repo: ICompanyRepo
}

export function createCompanyUsecase(repo: ICompanyRepo): ICompanyUsecase {
  const deps: CompanyUsecaseDeps = { repo }

  return {
    create: (req) => createCompany(deps, req),
    findById: (req) => findCompanyById(deps, req),
  }
}

export default createCompanyUsecase

// company.usecase/create.ts
import * as Entity from '@/entities/company.entity'
import { CompanyUsecaseDeps } from '../company.usecase'

export async function createCompany(
  deps: CompanyUsecaseDeps,
  req: Entity.CreateCompanyReq,
): Promise<Entity.Company> {
  return deps.repo.create(req)
}
```

**Key Points**:
- Factory function receives dependencies as parameters
- `Deps` interface defines required dependencies
- Each operation file receives `deps` as first parameter

---

### 3. Handler Layer

**File**: `*.handler/*.ts` + `*.handler/index.ts`

```typescript
// company.handler/index.ts
import { ICompanyUsecase } from '@/contracts/company.contract'
import { createCompanyHandler } from './create'
import { findCompanyByIdHandler } from './find-by-id'

export function createCompanyHandlerDeps(usecase: ICompanyUsecase) {
  return {
    create: createCompanyHandler(usecase),
    findById: findCompanyByIdHandler(usecase),
  }
}

// company.handler/create.ts
import { Context } from 'hono'
import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { ICompanyUsecase } from '@/contracts/company.contract'

export function createCompanyHandler(usecase: ICompanyUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const data = await usecase.create(body)
    return c.json(responseSuccess(data, 'Company created'), 201)
  }
}
```

**Key Points**:
- Handler factory returns an async function compatible with Hono
- Each handler is a separate file
- Returns `(c: Context<AppEnv>) => Promise<Response>`

---

### 4. Integration Layer

**File**: `index.ts` + operation files

```typescript
// integrations/pokemon/pokemon.service.ts
import type { IHttpClient } from '@/common/packages/types'
import type { IPokemonService } from '@/contracts/integration'
import type { PokemonClientConfig } from './client'
import { getPokemonById } from './pokemon.service/get-by-id'
import { getPokemonByName } from './pokemon.service/get-by-name'

export interface PokemonServiceDeps {
  config: PokemonClientConfig
  httpClient: IHttpClient
}

export function createPokemonService(
  config: PokemonClientConfig,
  httpClient: IHttpClient,
): IPokemonService {
  const deps: PokemonServiceDeps = { config, httpClient }

  return {
    getById: (id) => getPokemonById(deps, id),
    getByName: (name) => getPokemonByName(deps, name),
  }
}

export default createPokemonService

// integrations/pokemon/pokemon.service/get-by-id.ts
import type { IHttpClient } from '@/common/packages/types'
import type { Pokemon } from '@/contracts/integration'
import type { PokemonClientConfig } from '../client'
import { getResiliency, mapPokemonResponse } from './helpers'

export interface GetPokemonByIdDeps {
  config: PokemonClientConfig
  httpClient: IHttpClient
}

export async function getPokemonById(
  deps: GetPokemonByIdDeps,
  id: number,
): Promise<Pokemon> {
  const policy = await getResiliency()
  return policy.execute(async () => {
    const { data } = await deps.httpClient.get(
      deps.config.baseUrl,
      `/pokemon/${id}`,
      { timeout: deps.config.timeout },
    )
    return mapPokemonResponse(data)
  })
}
```

**Key Points**:
- Factory receives config and external dependencies
- Each operation is a separate file with its own `Deps` interface
- Thin class wrapper in `index.ts` for backward compatibility (optional)

---

## Wiring in Module Index

```typescript
// company.index.ts
import { createCompanyHandlerDeps } from './company.handler'
import { createCompanyRepo } from './company.repo'
import { createCompanyUsecase } from './company.usecase'

const repo = createCompanyRepo()
const usecase = createCompanyUsecase(repo)
const handler = createCompanyHandlerDeps(usecase)

const router = new Hono()
router.post('/', handler.create)
router.get('/:id', handler.findById)

export default router
```

---

## Benefits

1. **Testability**: Each function can be tested in isolation
2. **Composability**: Easy to swap implementations
3. **Single Responsibility**: One file = one operation
4. **Type Safety**: TypeScript infers types through the chain
5. **Tree Shaking**: Bundlers can eliminate unused functions

---

## Adding a New Operation

1. Create operation file: `company.usecase/find-by-email.ts`
2. Export function: `export async function findCompanyByEmail(deps, req)`
3. Add to factory: `findByEmail: (req) => findCompanyByEmail(deps, req)`
4. Update contract interface if needed
