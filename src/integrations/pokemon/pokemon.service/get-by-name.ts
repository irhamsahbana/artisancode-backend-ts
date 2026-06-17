import type { IHttpClient } from '@/common/packages/types'
import logger from '@/config/logger'
import type { Pokemon } from '@/contracts/integration'

import { getResiliency, withErrorHandling, mapPokemonResponse, type PokeApiPokemonResponse } from './helpers'

import type { PokemonClientConfig } from '../client'

export interface GetPokemonByNameDeps {
  config: PokemonClientConfig
  httpClient: IHttpClient
}

export async function getPokemonByName(
  deps: GetPokemonByNameDeps,
  name: string,
): Promise<Pokemon> {
  const policy = await getResiliency()
  return withErrorHandling(() =>
    policy.execute(async () => {
      logger.info(`[Pokemon] Fetching pokemon by name: ${name}`)
      const { data } = await deps.httpClient.get<PokeApiPokemonResponse>(
        deps.config.baseUrl,
        `/pokemon/${name.toLowerCase()}`,
      )
      return mapPokemonResponse(data)
    }),
  )
}
