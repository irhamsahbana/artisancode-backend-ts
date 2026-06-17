import logger from '@/config/logger'
import type { Pokemon } from '@/contracts/integration'

import { getResiliency, withErrorHandling, mapPokemonResponse, type PokeApiPokemonResponse, type PokemonServiceDeps } from './helpers'

export async function getPokemonById(
  deps: PokemonServiceDeps,
  id: number,
): Promise<Pokemon> {
  const policy = await getResiliency()
  return withErrorHandling(() =>
    policy.execute(async () => {
      logger.info(`[Pokemon] Fetching pokemon by id: ${id}`)
      const { data } = await deps.httpClient.get<PokeApiPokemonResponse>(
        deps.config.baseUrl,
        `/pokemon/${id}`,
      )
      return mapPokemonResponse(data)
    }),
  )
}
