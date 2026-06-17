import { HttpAdapter } from '@/common/packages/http-client'
import type { IPokemonService } from '@/contracts/integration'

import { createPokemonClientConfig } from './client'
import { PokemonService } from './pokemon.service'

export class PokemonIntegration implements IPokemonService {
  private service: PokemonService

  constructor() {
    const config = createPokemonClientConfig()
    const httpClient = new HttpAdapter()
    this.service = new PokemonService(config, httpClient)
  }

  getById(id: number) {
    return this.service.getById(id)
  }

  getByName(name: string) {
    return this.service.getByName(name)
  }

  list(limit?: number, offset?: number) {
    return this.service.list(limit, offset)
  }

  search(query: string) {
    return this.service.search(query)
  }
}
