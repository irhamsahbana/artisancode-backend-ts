export interface PokemonClientConfig {
  baseUrl: string
  timeout: number
}

export function createPokemonClientConfig(): PokemonClientConfig {
  return {
    baseUrl: process.env.POKEMON_API_BASE_URL || 'https://pokeapi.co/api/v2',
    timeout: parseInt(process.env.POKEMON_API_TIMEOUT || '10000', 10),
  }
}
