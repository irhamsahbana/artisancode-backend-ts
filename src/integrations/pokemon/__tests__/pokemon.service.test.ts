import { describe, expect, it, mock as bunMock } from 'bun:test'

import type { IPokemonService, Pokemon, PokemonListResult } from '@/contracts/integration'

import { MockPokemonService } from '../mock-pokemon.service'

// ── Approach 1: Using MockPokemonService directly ─────────────────────────────

describe('MockPokemonService', () => {
  it('getById returns pokemon when found', async () => {
    const service = new MockPokemonService()
    const result = await service.getById(25)

    expect(result.id).toBe(25)
    expect(result.name).toBe('pikachu')
    expect(result.types).toEqual(['electric'])
  })

  it('getById throws when not found', async () => {
    const service = new MockPokemonService()
    await expect(service.getById(999)).rejects.toThrow('Pokemon not found: 999')
  })

  it('getByName returns pokemon case-insensitive', async () => {
    const service = new MockPokemonService()
    const result = await service.getByName('Charmander')

    expect(result.id).toBe(4)
    expect(result.name).toBe('charmander')
  })

  it('getByName throws when not found', async () => {
    const service = new MockPokemonService()
    await expect(service.getByName('missingno')).rejects.toThrow('Pokemon not found: missingno')
  })

  it('list returns paginated results', async () => {
    const service = new MockPokemonService()
    const result = await service.list(2, 0)

    expect(result.results).toHaveLength(2)
    expect(result.results[0].name).toBe('bulbasaur')
    expect(result.results[1].name).toBe('charmander')
    expect(result.next).toBeTruthy()
  })

  it('list returns null next when at end', async () => {
    const service = new MockPokemonService()
    const result = await service.list(10, 0)

    expect(result.results.length).toBeLessThanOrEqual(10)
    expect(result.next).toBeNull()
  })

  it('search filters by name', async () => {
    const service = new MockPokemonService()
    const result = await service.search('saur')

    expect(result.results).toHaveLength(1)
    expect(result.results[0].name).toBe('bulbasaur')
  })

  it('search returns empty when no match', async () => {
    const service = new MockPokemonService()
    const result = await service.search('xyz')

    expect(result.results).toHaveLength(0)
  })
})

// ── Approach 2: Using bun:test mock() with IPokemonService interface ──────────

describe('PokemonService with bun:test mock()', () => {
  function createMockPokemonService(overrides?: Partial<IPokemonService>): IPokemonService {
    return {
      getById: bunMock(() => Promise.resolve({ id: 1, name: 'bulbasaur', height: 7, weight: 69, types: ['grass'], abilities: ['overgrow'], sprites: { front_default: null, front_shiny: null } } as Pokemon)),
      getByName: bunMock(() => Promise.resolve({ id: 1, name: 'bulbasaur', height: 7, weight: 69, types: ['grass'], abilities: ['overgrow'], sprites: { front_default: null, front_shiny: null } } as Pokemon)),
      list: bunMock(() => Promise.resolve({ count: 1, next: null, previous: null, results: [{ name: 'bulbasaur', url: '' }] } as PokemonListResult)),
      search: bunMock(() => Promise.resolve({ count: 1, next: null, previous: null, results: [{ name: 'bulbasaur', url: '' }] } as PokemonListResult)),
      ...overrides,
    }
  }

  it('calls getById and returns mocked data', async () => {
    const service = createMockPokemonService()
    const result = await service.getById(1)

    expect(result.name).toBe('bulbasaur')
    expect(service.getById).toHaveBeenCalledWith(1)
  })

  it('allows overriding specific methods', async () => {
    const customPokemon = { id: 25, name: 'pikachu', height: 4, weight: 60, types: ['electric'], abilities: ['static'], sprites: { front_default: null, front_shiny: null } } as Pokemon

    const service = createMockPokemonService({
      getById: bunMock(() => Promise.resolve(customPokemon)),
    })

    const result = await service.getById(25)
    expect(result.name).toBe('pikachu')
    expect(result.id).toBe(25)
  })

  it('can verify method was called with expected args', async () => {
    const service = createMockPokemonService()
    await service.getByName('pikachu')
    await service.list(10, 0)

    expect(service.getByName).toHaveBeenCalledWith('pikachu')
    expect(service.list).toHaveBeenCalledWith(10, 0)
  })
})
