import { describe, it, expect } from 'bun:test'

import { HttpAdapter } from '@/common/packages/http-client'

import { PokemonService } from '../pokemon.service'

const config = {
  baseUrl: 'https://pokeapi.co/api/v2',
  timeout: 10000,
}

const httpClient = new HttpAdapter()
const service = new PokemonService(config, httpClient)

describe('PokemonService Integration (real PokeAPI)', () => {
  it('getById returns pikachu', async () => {
    const pokemon = await service.getById(25)

    expect(pokemon.id).toBe(25)
    expect(pokemon.name).toBe('pikachu')
    expect(pokemon.height).toBe(4)
    expect(pokemon.weight).toBe(60)
    expect(pokemon.types).toContain('electric')
    expect(pokemon.abilities.length).toBeGreaterThan(0)
  })

  it('getByName returns bulbasaur (case-insensitive)', async () => {
    const pokemon = await service.getByName('Bulbasaur')

    expect(pokemon.id).toBe(1)
    expect(pokemon.name).toBe('bulbasaur')
    expect(pokemon.types).toContain('grass')
    expect(pokemon.types).toContain('poison')
  })

  it('list returns paginated results', async () => {
    const result = await service.list(5, 0)

    expect(result.count).toBeGreaterThan(0)
    expect(result.results).toHaveLength(5)
    expect(result.next).toBeTruthy()
    expect(result.previous).toBeNull()

    const first = result.results[0]
    expect(first.name).toBeTruthy()
    expect(first.url).toContain('pokeapi.co')
  })

  it('list with offset returns different results', async () => {
    const page1 = await service.list(5, 0)
    const page2 = await service.list(5, 5)

    expect(page1.results[0].name).not.toBe(page2.results[0].name)
  })

  it('search filters by name', async () => {
    const result = await service.search('saur')

    expect(result.results.length).toBeGreaterThan(0)
    result.results.forEach((p) => {
      expect(p.name).toContain('saur')
    })
  })

  it('search returns empty for no match', async () => {
    const result = await service.search('xyznotexist123')

    expect(result.results).toHaveLength(0)
  })
})
