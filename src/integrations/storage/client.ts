import { S3Client } from '@aws-sdk/client-s3'

import { env } from '@/config/env'

export interface S3Config {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
  publicBaseUrl: string
}

export function createS3Config(): S3Config {
  return {
    bucket: env.S3.BUCKET,
    region: env.S3.REGION,
    accessKeyId: env.S3.ACCESS_KEY_ID,
    secretAccessKey: env.S3.SECRET_ACCESS_KEY,
    endpoint: env.S3.ENDPOINT,
    publicBaseUrl: env.S3.PUBLIC_BASE_URL,
  }
}

export function createS3Client(config: S3Config): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}
