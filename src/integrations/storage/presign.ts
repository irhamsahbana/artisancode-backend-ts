import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import type { S3Config } from './client'

export async function presignUpload(
  config: S3Config,
  client: import('@aws-sdk/client-s3').S3Client,
  req: { key: string; contentType: string },
): Promise<{ url: string; key: string; method: string; headers: Record<string, string> }> {
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: req.key,
    ContentType: req.contentType,
  })

  const url = await getSignedUrl(client, command, { expiresIn: 900 }) // 15 minutes

  return {
    url,
    key: req.key,
    method: 'PUT',
    headers: { 'Content-Type': req.contentType },
  }
}

export async function getPresignedGetUrl(
  config: S3Config,
  client: import('@aws-sdk/client-s3').S3Client,
  key: string,
  expiresIn = 900,
): Promise<string> {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3')

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  })

  return getSignedUrl(client, command, { expiresIn })
}
