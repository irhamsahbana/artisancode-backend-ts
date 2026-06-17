import type { IHttpClient } from '@/common/packages/types'
import logger from '@/config/logger'
import type { PokemonListResult } from '@/contracts/integration'

import { getResiliency, type PokeApiListResponse } from './helpers'

import type { PokemonClientConfig } from '../client'

export interface ListPokemonDeps {
  config: PokemonClientConfig
  httpClient: IHttpClient
}

export async function listPokemon(
  deps: ListPokemonDeps,
  limit = 20,
  offset = 0,
): Promise<PokemonListResult> {
  const policy = await getResiliency()
  return policy.execute(async () => {
    logger.info(`[Pokemon] Listing pokemon (limit: ${limit}, offset: ${offset})`)
    const { data } = await deps.httpClient.get<PokeApiListResponse>(
      deps.config.baseUrl,
      '/pokemon',
      {
        query: { limit, offset },
        timeout: deps.config.timeout,
      },
    )
    return data
  })
}
