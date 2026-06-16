import logger from '@/config/logger'
import type { Pokemon, PokemonListResult, IPokemonService } from '@/contracts/integration'

const MOCK_POKEMONS: Record<number, Pokemon> = {
  1: {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    types: ['grass', 'poison'],
    abilities: ['overgrow', 'chlorophyll'],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png',
    },
  },
  4: {
    id: 4,
    name: 'charmander',
    height: 6,
    weight: 85,
    types: ['fire'],
    abilities: ['blaze', 'solar-power'],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/4.png',
    },
  },
  7: {
    id: 7,
    name: 'squirtle',
    height: 5,
    weight: 90,
    types: ['water'],
    abilities: ['torrent', 'rain-dish'],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
      front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/7.png',
    },
  },
  25: {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    types: ['electric'],
    abilities: ['static', 'lightning-rod'],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
    },
  },
}

const ALL_POKEMON_LIST = Object.values(MOCK_POKEMONS).map((p) => ({
  name: p.name,
  url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
}))

export class MockPokemonService implements IPokemonService {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getById(id: number): Promise<Pokemon> {
    await this.delay(50) // simulate network latency
    logger.info(`[Pokemon Mock] Fetching pokemon by id: ${id}`)

    const pokemon = MOCK_POKEMONS[id]
    if (!pokemon) {
      throw new Error(`Pokemon not found: ${id}`)
    }
    return { ...pokemon }
  }

  async getByName(name: string): Promise<Pokemon> {
    await this.delay(50)
    logger.info(`[Pokemon Mock] Fetching pokemon by name: ${name}`)

    const pokemon = Object.values(MOCK_POKEMONS).find(
      (p) => p.name === name.toLowerCase(),
    )
    if (!pokemon) {
      throw new Error(`Pokemon not found: ${name}`)
    }
    return { ...pokemon }
  }

  async list(limit = 20, offset = 0): Promise<PokemonListResult> {
    await this.delay(50)
    logger.info(`[Pokemon Mock] Listing pokemon (limit: ${limit}, offset: ${offset})`)

    const results = ALL_POKEMON_LIST.slice(offset, offset + limit)
    return {
      count: ALL_POKEMON_LIST.length,
      next: offset + limit < ALL_POKEMON_LIST.length
        ? `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset + limit}`
        : null,
      previous: offset > 0
        ? `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${Math.max(0, offset - limit)}`
        : null,
      results,
    }
  }

  async search(query: string): Promise<PokemonListResult> {
    await this.delay(50)
    logger.info(`[Pokemon Mock] Searching pokemon: ${query}`)

    const filtered = ALL_POKEMON_LIST.filter((p) =>
      p.name.includes(query.toLowerCase()),
    )
    return {
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered,
    }
  }
}
