import logger from '@/config/logger'
import type { PokemonListResult } from '@/contracts/integration'

import { getResiliency, withErrorHandling, type PokeApiListResponse, type PokemonServiceDeps } from './helpers'

export async function listPokemon(
  deps: PokemonServiceDeps,
  limit = 20,
  offset = 0,
): Promise<PokemonListResult> {
  const policy = await getResiliency()
  return withErrorHandling(() =>
    policy.execute(async () => {
      logger.info(`[Pokemon] Listing pokemon (limit: ${limit}, offset: ${offset})`)
      const { data } = await deps.httpClient.get<PokeApiListResponse>(
        deps.config.baseUrl,
        '/pokemon',
        {
          query: { limit, offset },
        },
      )
      return data
    }),
  )
}
