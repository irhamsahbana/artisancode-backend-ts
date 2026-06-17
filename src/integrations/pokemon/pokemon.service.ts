import { createRetryPolicy, createCircuitBreakerPolicy, wrapPolicies } from '@/common/packages/resilience'
import type { ResiliencePolicy } from '@/common/packages/resilience'
import type { IHttpClient } from '@/common/packages/types'
import logger from '@/config/logger'
import type { Pokemon, PokemonListResult, IPokemonService } from '@/contracts/integration'

import type { PokemonClientConfig } from './client'


interface PokeApiPokemonResponse {
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

interface PokeApiListResponse {
  count: number
  next: string | null
  previous: string | null
  results: { name: string; url: string }[]
}

// Lazily-initialized resilience policy
let resiliency: ResiliencePolicy | null = null

async function getResiliency(): Promise<ResiliencePolicy> {
  if (!resiliency) {
    const retryPolicy = await createRetryPolicy({ maxAttempts: 3 })
    const circuitBreakerPolicy = await createCircuitBreakerPolicy({ threshold: 5 })
    resiliency = await wrapPolicies(retryPolicy, circuitBreakerPolicy)
  }
  return resiliency
}

function mapPokemonResponse(data: PokeApiPokemonResponse): Pokemon {
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

export class PokemonService implements IPokemonService {
  private config: PokemonClientConfig
  private httpClient: IHttpClient

  constructor(config: PokemonClientConfig, httpClient: IHttpClient) {
    this.config = config
    this.httpClient = httpClient
  }

  async getById(id: number): Promise<Pokemon> {
    const policy = await getResiliency()
    return policy.execute(async () => {
      logger.info(`[Pokemon] Fetching pokemon by id: ${id}`)
      const { data } = await this.httpClient.get<PokeApiPokemonResponse>(this.config.baseUrl, `/pokemon/${id}`, {
        timeout: this.config.timeout,
      })
      return mapPokemonResponse(data)
    })
  }

  async getByName(name: string): Promise<Pokemon> {
    const policy = await getResiliency()
    return policy.execute(async () => {
      logger.info(`[Pokemon] Fetching pokemon by name: ${name}`)
      const { data } = await this.httpClient.get<PokeApiPokemonResponse>(this.config.baseUrl, `/pokemon/${name.toLowerCase()}`, {
        timeout: this.config.timeout,
      })
      return mapPokemonResponse(data)
    })
  }

  async list(limit = 20, offset = 0): Promise<PokemonListResult> {
    const policy = await getResiliency()
    return policy.execute(async () => {
      logger.info(`[Pokemon] Listing pokemon (limit: ${limit}, offset: ${offset})`)
      const { data } = await this.httpClient.get<PokeApiListResponse>(this.config.baseUrl, '/pokemon', {
        query: { limit, offset },
        timeout: this.config.timeout,
      })
      return data
    })
  }

  async search(query: string): Promise<PokemonListResult> {
    const policy = await getResiliency()
    return policy.execute(async () => {
      logger.info(`[Pokemon] Searching pokemon: ${query}`)
      const { data } = await this.httpClient.get<PokeApiListResponse>(this.config.baseUrl, '/pokemon', {
        query: { limit: 1000 },
        timeout: this.config.timeout,
      })
      const filtered = data.results.filter((p: { name: string; url: string }) => p.name.includes(query.toLowerCase()))
      return {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      }
    })
  }
}
