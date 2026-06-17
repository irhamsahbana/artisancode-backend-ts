import type { IHttpClient } from '@/common/packages/types'
import type { IPokemonService } from '@/contracts/integration'

import { getPokemonById } from './pokemon.service/get-by-id'
import { getPokemonByName } from './pokemon.service/get-by-name'
import { listPokemon } from './pokemon.service/list'
import { searchPokemon } from './pokemon.service/search'

import type { PokemonClientConfig } from './client'

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
    list: (limit, offset) => listPokemon(deps, limit, offset),
    search: (query) => searchPokemon(deps, query),
  }
}

export default createPokemonService
