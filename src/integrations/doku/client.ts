import { env } from '@/config/env'

export interface DokuClientConfig {
  clientId: string
  secretKey: string
  publicKey: string
  baseUrl: string
}

export function createDokuClientConfig(): DokuClientConfig {
  const encodedPublicKey = env.DOKU.PUBLIC_KEY || ''

  return {
    clientId: env.DOKU.CLIENT_ID || '',
    secretKey: env.DOKU.SECRET_KEY || '',
    publicKey: encodedPublicKey ? Buffer.from(encodedPublicKey, 'base64').toString('utf-8') : '',
    baseUrl: env.IS_PRODUCTION ? 'https://api.doku.com' : 'https://api-sandbox.doku.com',
  }
}
