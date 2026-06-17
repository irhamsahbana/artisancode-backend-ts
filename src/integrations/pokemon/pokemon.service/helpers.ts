import { isBrokenCircuitError, isTaskCancelledError } from 'cockatiel'

import { CircuitBreakerError, TimeoutError, createRetryPolicy, createCircuitBreakerPolicy, createTimeoutPolicy, wrapPolicies } from '@/common/packages/resilience'
import type { ResiliencePolicy } from '@/common/packages/resilience'
import { AppError, ErrorCode } from '@/common/packages/types'
import type { IHttpClient } from '@/common/packages/types'
import type { Pokemon } from '@/contracts/integration'

import type { PokemonClientConfig } from '../client'

export interface PokemonServiceDeps {
  config: PokemonClientConfig
  httpClient: IHttpClient
}

export interface PokeApiPokemonResponse {
  id: number
  name: string
  height: number
  weight: number
  types: { type: { name: string } }[]
  abilities: { ability: { name: string } }[]
  sprites: {
    front_default: string | null
    front_shiny: string | null
  }
}

export interface PokeApiListResponse {
  count: number
  next: string | null
  previous: string | null
  results: { name: string; url: string }[]
}

// Lazily-initialized resilience policy
let resiliency: ResiliencePolicy | null = null

export async function getResiliency(): Promise<ResiliencePolicy> {
  if (!resiliency) {
    const retryPolicy = await createRetryPolicy({ maxAttempts: 3 })
    const circuitBreakerPolicy = await createCircuitBreakerPolicy({ threshold: 5 })
    const timeoutPolicy = await createTimeoutPolicy({ duration: 10_000 })
    resiliency = await wrapPolicies(retryPolicy, circuitBreakerPolicy, timeoutPolicy)
  }
  return resiliency
}

export async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (isTaskCancelledError(error)) {
      throw new TimeoutError()
    }
    if (isBrokenCircuitError(error)) {
      throw new CircuitBreakerError()
    }
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, error instanceof Error ? error.message : 'Unknown error', {
      httpCode: 500,
      data: error,
    })
  }
}
 
export function mapPokemonResponse(data: PokeApiPokemonResponse): Pokemon {
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types.map((t) => t.type.name),
    abilities: data.abilities.map((a) => a.ability.name),
    sprites: {
      front_default: data.sprites.front_default,
      front_shiny: data.sprites.front_shiny,
    },
  }
}
