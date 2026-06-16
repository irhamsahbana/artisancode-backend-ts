import { IEmailService, IPaymentGateway, IPokemonService, IStorageService } from '@/contracts/integration'

import { DokuIntegration } from './doku'
import { MockEmailService } from './email'
import { PokemonIntegration } from './pokemon'
import { StorageIntegration } from './storage'

// Factory functions — each module calls these to get integration instances

export function createPaymentGateway(): IPaymentGateway {
  return new DokuIntegration()
}

export function createEmailService(): IEmailService {
  return new MockEmailService()
}

export function createStorageService(): IStorageService {
  return new StorageIntegration()
}

export function createPokemonService(): IPokemonService {
  return new PokemonIntegration()
}
