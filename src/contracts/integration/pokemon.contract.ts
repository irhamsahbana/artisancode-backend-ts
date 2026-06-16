export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  types: string[]
  abilities: string[]
  sprites: {
    front_default: string | null
    front_shiny: string | null
  }
}

export interface PokemonListResult {
  count: number
  next: string | null
  previous: string | null
  results: { name: string; url: string }[]
}

export interface IPokemonService {
  getById(id: number): Promise<Pokemon>
  getByName(name: string): Promise<Pokemon>
  list(limit?: number, offset?: number): Promise<PokemonListResult>
  search(query: string): Promise<PokemonListResult>
}
