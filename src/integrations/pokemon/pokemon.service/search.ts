import logger from '@/config/logger'
import type { PokemonListResult } from '@/contracts/integration'

import { getResiliency, withErrorHandling, type PokeApiListResponse, type PokemonServiceDeps } from './helpers'

export async function searchPokemon(
  deps: PokemonServiceDeps,
  query: string,
): Promise<PokemonListResult> {
  const policy = await getResiliency()
  return withErrorHandling(() =>
    policy.execute(async () => {
      logger.info(`[Pokemon] Searching pokemon: ${query}`)
      const { data } = await deps.httpClient.get<PokeApiListResponse>(
        deps.config.baseUrl,
        '/pokemon',
        {
          query: { limit: 1000 },
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
    }),
  )
}
