import type { IHttpClient } from '@/common/packages/types'
import logger from '@/config/logger'
import type { PokemonListResult } from '@/contracts/integration'

import { getResiliency, type PokeApiListResponse } from './helpers'

import type { PokemonClientConfig } from '../client'

export interface SearchPokemonDeps {
  config: PokemonClientConfig
  httpClient: IHttpClient
}

export async function searchPokemon(
  deps: SearchPokemonDeps,
  query: string,
): Promise<PokemonListResult> {
  const policy = await getResiliency()
  return policy.execute(async () => {
    logger.info(`[Pokemon] Searching pokemon: ${query}`)
    const { data } = await deps.httpClient.get<PokeApiListResponse>(
      deps.config.baseUrl,
      '/pokemon',
      {
        query: { limit: 1000 },
        timeout: deps.config.timeout,
      },
    )
    const filtered = data.results.filter((p: { name: string; url: string }) =>
      p.name.includes(query.toLowerCase()),
    )
    return {
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered,
    }
  })
}
