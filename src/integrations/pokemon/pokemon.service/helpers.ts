import { createRetryPolicy, createCircuitBreakerPolicy, wrapPolicies } from '@/common/packages/resilience'
import type { ResiliencePolicy } from '@/common/packages/resilience'
import type { Pokemon } from '@/contracts/integration'

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
    resiliency = await wrapPolicies(retryPolicy, circuitBreakerPolicy)
  }
  return resiliency
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
