export interface PokemonClientConfig {
  baseUrl: string
}

export function createPokemonClientConfig(): PokemonClientConfig {
  return {
    baseUrl: process.env.POKEMON_API_BASE_URL || 'https://pokeapi.co/api/v2',
  }
}
